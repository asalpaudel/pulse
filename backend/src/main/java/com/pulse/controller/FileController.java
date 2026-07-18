package com.pulse.controller;

import com.pulse.dto.StoredFileDto;
import com.pulse.security.SecurityUtil;
import com.pulse.security.UserPrincipal;
import com.pulse.service.FileStorageService;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileStorageService files;

    public FileController(FileStorageService files) {
        this.files = files;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public StoredFileDto upload(@RequestPart("file") MultipartFile file) {
        return files.upload(SecurityUtil.currentUserId(), file);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> download(@PathVariable String id) {
        UserPrincipal user = SecurityUtil.currentUser();
        FileStorageService.FileDownload download = files.download(id, user.getId(), user.getRole());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(download.metadata().contentType()));
        headers.setContentLength(download.metadata().sizeBytes());
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename(download.metadata().name(), StandardCharsets.UTF_8).build());
        headers.setCacheControl(CacheControl.noStore());
        return ResponseEntity.ok().headers(headers).body(download.resource());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        UserPrincipal user = SecurityUtil.currentUser();
        files.delete(id, user.getId(), user.getRole());
        return ResponseEntity.noContent().build();
    }
}
