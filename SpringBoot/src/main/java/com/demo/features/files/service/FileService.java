package com.demo.features.files.service;

import com.demo.features.files.repository.FileRepository;

import com.demo.common.exception.ResourceNotFoundException;
import com.demo.features.files.dto.FileResponse;
import com.demo.features.files.dto.UploadResponse;
import com.demo.domain.User;
import com.demo.domain.FileEntity;
import com.demo.features.users.repository.UserRepository;
import com.demo.infrastructure.storage.StorageService;
import com.demo.infrastructure.storage.StorageService.StoredFile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileService {

    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    @Transactional
    public UploadResponse upload(String userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UsuÃƒÂ¯Ã‚Â¿Ã‚Â½rio nÃƒÂ¯Ã‚Â¿Ã‚Â½o encontrado"));

        StoredFile storedFile = storageService.upload(file);

        FileEntity fileEntity = FileEntity.builder()
                .originalName(file.getOriginalFilename())
                .storedName(storedFile.storedName())
                .mimeType(file.getContentType())
                .size(file.getSize())
                .storagePath(storedFile.storedName())
                .storageType(FileEntity.StorageType.valueOf(storedFile.storageType().toUpperCase()))
                .uploadedBy(user)
                .build();

        fileEntity = fileRepository.save(fileEntity);

        log.info("File uploaded: {} by user {}", fileEntity.getId(), userId);

        return new UploadResponse(
                "Arquivo enviado com sucesso",
                mapToResponse(fileEntity)
        );
    }

    public List<FileResponse> getUserFiles(String userId) {
        return fileRepository.findByUploadedByIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public FileResponse getById(String id, String userId) {
        FileEntity file = fileRepository.findByIdAndUploadedById(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Arquivo nÃƒÂ¯Ã‚Â¿Ã‚Â½o encontrado"));

        return mapToResponse(file);
    }

    public byte[] download(String id, String userId) {
        FileEntity file = fileRepository.findByIdAndUploadedById(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Arquivo nÃƒÂ¯Ã‚Â¿Ã‚Â½o encontrado"));

        return storageService.download(file.getStoredName());
    }

    @Transactional
    public void delete(String id, String userId) {
        FileEntity file = fileRepository.findByIdAndUploadedById(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Arquivo nÃƒÂ¯Ã‚Â¿Ã‚Â½o encontrado"));

        storageService.delete(file.getStoredName());
        fileRepository.delete(file);

        log.info("File deleted: {}", id);
    }

    private FileResponse mapToResponse(FileEntity file) {
        return new FileResponse(
                file.getId(),
                file.getOriginalName(),
                file.getStoredName(),
                file.getMimeType(),
                file.getSize(),
                "/api/files/" + file.getId() + "/download",
                file.getStorageType().name(),
                file.getUploadedBy().getId(),
                file.getCreatedAt()
        );
    }
}
