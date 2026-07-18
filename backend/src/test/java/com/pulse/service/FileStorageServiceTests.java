package com.pulse.service;

import com.pulse.dto.StoredFileDto;
import com.pulse.entity.Role;
import com.pulse.entity.StoredFile;
import com.pulse.exception.ApiException;
import com.pulse.repository.StoredFileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Path;
import java.lang.reflect.Proxy;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;

class FileStorageServiceTests {

    @TempDir
    Path storageRoot;

    @Test
    void storesValidatedFilesWithSafeNamesAndHashes() {
        AtomicReference<StoredFile> savedFile = new AtomicReference<>();
        StoredFileRepository repository = repository(savedFile);
        FileStorageService service = new FileStorageService(repository, storageRoot.toString());
        byte[] png = new byte[]{(byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2};

        StoredFileDto stored = service.upload(7L,
                new MockMultipartFile("file", "../../avatar.png", "image/png", png));

        assertEquals("avatar.png", stored.name());
        assertEquals(png.length, stored.sizeBytes());
        assertEquals(64, stored.sha256().length());
        assertNotNull(savedFile.get());
    }

    @Test
    void rejectsFilesWhoseContentDoesNotMatchTheDeclaredType() {
        FileStorageService service = new FileStorageService(repository(new AtomicReference<>()), storageRoot.toString());

        ApiException error = assertThrows(ApiException.class, () -> service.upload(7L,
                new MockMultipartFile("file", "fake.png", "image/png", "not an image".getBytes())));

        assertEquals(400, error.getStatus().value());
    }

    @Test
    void preventsAnotherUserFromDownloadingTheFile() {
        StoredFile stored = StoredFile.builder().id("file-id").ownerUserId(7L).storageName("stored-name")
                .originalName("document.pdf").contentType("application/pdf").sizeBytes(10).sha256("a").build();
        StoredFileRepository repository = repository(new AtomicReference<>(stored));
        FileStorageService service = new FileStorageService(repository, storageRoot.toString());

        ApiException error = assertThrows(ApiException.class,
                () -> service.download("file-id", 8L, Role.DONOR));

        assertEquals(403, error.getStatus().value());
    }

    private StoredFileRepository repository(AtomicReference<StoredFile> storedFile) {
        return (StoredFileRepository) Proxy.newProxyInstance(
                StoredFileRepository.class.getClassLoader(),
                new Class<?>[]{StoredFileRepository.class},
                (proxy, method, arguments) -> switch (method.getName()) {
                    case "save" -> {
                        StoredFile saved = (StoredFile) arguments[0];
                        storedFile.set(saved);
                        yield saved;
                    }
                    case "findById" -> Optional.ofNullable(storedFile.get())
                            .filter(file -> file.getId().equals(arguments[0]));
                    case "delete" -> {
                        storedFile.set(null);
                        yield null;
                    }
                    case "toString" -> "InMemoryStoredFileRepository";
                    default -> throw new UnsupportedOperationException(method.getName());
                });
    }
}
