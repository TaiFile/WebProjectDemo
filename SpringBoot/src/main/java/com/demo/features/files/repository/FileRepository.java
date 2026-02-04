package com.demo.features.files.repository;

import com.demo.domain.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, String> {

    List<FileEntity> findByUploadedByIdOrderByCreatedAtDesc(String userId);

    Optional<FileEntity> findByIdAndUploadedById(String id, String userId);
}
