package com.pulse.service;

import com.pulse.dto.StoredFileDto;
import com.pulse.entity.Role;
import com.pulse.entity.StoredFile;
import com.pulse.exception.ApiException;
import com.pulse.repository.StoredFileRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final long MAX_BYTES = 5L * 1024 * 1024;
    private static final Map<String, byte[]> SIGNATURES = Map.of(
            "image/png", new byte[]{(byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a},
            "image/jpeg", new byte[]{(byte) 0xff, (byte) 0xd8, (byte) 0xff},
            "application/pdf", new byte[]{0x25, 0x50, 0x44, 0x46, 0x2d}
    );
    private static final Set<String> PRIVILEGED_ROLES = Set.of("ADMIN", "STAFF", "SUPER_ADMIN");

    private final StoredFileRepository repository;
    private final Path storageRoot;

    public FileStorageService(
            StoredFileRepository repository,
            @Value("${pulse.files.storage-path:uploads}") String storagePath
    ) {
        this.repository = repository;
        this.storageRoot = Path.of(storagePath).toAbsolutePath().normalize();
    }

    @Transactional
    public StoredFileDto upload(Long ownerUserId, MultipartFile multipartFile) {
        byte[] content = validatedContent(multipartFile);
        String contentType = multipartFile.getContentType();
        String storageName = UUID.randomUUID().toString();
        Path destination = resolve(storageName);

        try {
            Files.createDirectories(storageRoot);
            Files.write(destination, content, StandardOpenOption.CREATE_NEW);
            StoredFile stored = repository.save(StoredFile.builder()
                    .id(UUID.randomUUID().toString())
                    .ownerUserId(ownerUserId)
                    .originalName(safeFilename(multipartFile.getOriginalFilename()))
                    .storageName(storageName)
                    .contentType(contentType)
                    .sizeBytes(content.length)
                    .sha256(sha256(content))
                    .build());
            return StoredFileDto.from(stored);
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "The file could not be stored");
        } catch (RuntimeException ex) {
            deleteQuietly(destination);
            throw ex;
        }
    }

    @Transactional(readOnly = true)
    public FileDownload download(String id, Long requesterUserId, Role requesterRole) {
        StoredFile stored = authorizedFile(id, requesterUserId, requesterRole);
        Path path = resolve(stored.getStorageName());
        if (!Files.isRegularFile(path)) {
            throw ApiException.notFound("File content not found");
        }
        return new FileDownload(StoredFileDto.from(stored), new FileSystemResource(path));
    }

    @Transactional
    public void delete(String id, Long requesterUserId, Role requesterRole) {
        StoredFile stored = authorizedFile(id, requesterUserId, requesterRole);
        repository.delete(stored);
        deleteQuietly(resolve(stored.getStorageName()));
    }

    private StoredFile authorizedFile(String id, Long requesterUserId, Role requesterRole) {
        StoredFile stored = repository.findById(id).orElseThrow(() -> ApiException.notFound("File not found"));
        boolean privileged = requesterRole != null && PRIVILEGED_ROLES.contains(requesterRole.name());
        if (!stored.getOwnerUserId().equals(requesterUserId) && !privileged) {
            throw ApiException.forbidden("You do not have access to this file");
        }
        return stored;
    }

    private byte[] validatedContent(MultipartFile multipartFile) {
        if (multipartFile == null || multipartFile.isEmpty()) {
            throw ApiException.badRequest("Choose a file to upload");
        }
        if (multipartFile.getSize() > MAX_BYTES) {
            throw ApiException.badRequest("File size must not exceed 5 MB");
        }
        String contentType = multipartFile.getContentType();
        try {
            byte[] content = multipartFile.getBytes();
            if ("image/webp".equals(contentType)) {
                if (!isWebp(content)) throw ApiException.badRequest("File content does not match its type");
            } else {
                byte[] signature = SIGNATURES.get(contentType);
                if (signature == null || !startsWith(content, signature)) {
                    throw ApiException.badRequest("Only valid PNG, JPEG, WebP, or PDF files are allowed");
                }
            }
            return content;
        } catch (IOException ex) {
            throw ApiException.badRequest("The uploaded file could not be read");
        }
    }

    private Path resolve(String storageName) {
        Path resolved = storageRoot.resolve(storageName).normalize();
        if (!resolved.startsWith(storageRoot)) {
            throw ApiException.badRequest("Invalid file path");
        }
        return resolved;
    }

    private String safeFilename(String originalFilename) {
        String candidate = originalFilename == null ? "file" : originalFilename.replace('\\', '/');
        candidate = candidate.substring(candidate.lastIndexOf('/') + 1)
                .replaceAll("[\\p{Cntrl}]", "_").trim();
        if (candidate.isBlank()) candidate = "file";
        return candidate.substring(0, Math.min(candidate.length(), 180));
    }

    private String sha256(byte[] content) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(content));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is unavailable", ex);
        }
    }

    private boolean startsWith(byte[] content, byte[] signature) {
        if (content.length < signature.length) return false;
        for (int i = 0; i < signature.length; i++) {
            if (content[i] != signature[i]) return false;
        }
        return true;
    }

    private boolean isWebp(byte[] content) {
        return content.length >= 12
                && content[0] == 'R' && content[1] == 'I' && content[2] == 'F' && content[3] == 'F'
                && content[8] == 'W' && content[9] == 'E' && content[10] == 'B' && content[11] == 'P';
    }

    private void deleteQuietly(Path path) {
        try {
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
            // Metadata remains authoritative; orphan cleanup can retry later.
        }
    }

    public record FileDownload(StoredFileDto metadata, FileSystemResource resource) {
    }
}
