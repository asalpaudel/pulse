package com.pulse.dto;

import com.pulse.entity.StoredFile;

import java.time.Instant;

public record StoredFileDto(
        String id,
        String name,
        String contentType,
        long sizeBytes,
        String sha256,
        Instant createdAt
) {
    public static StoredFileDto from(StoredFile file) {
        return new StoredFileDto(file.getId(), file.getOriginalName(), file.getContentType(),
                file.getSizeBytes(), file.getSha256(), file.getCreatedAt());
    }
}
