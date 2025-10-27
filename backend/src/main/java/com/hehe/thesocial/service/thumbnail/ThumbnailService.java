package com.hehe.thesocial.service.thumbnail;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
@Service
public class ThumbnailService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${server.host:172.20.82.76}")
    private String serverHost;

    @Value("${server.port:8082}")
    private String serverPort;

    @Value("${server.servlet.context-path:/api/v1}")
    private String contextPath;

    /**
     * Generate thumbnail from video file (simplified version)
     * @param videoPath Path to the video file
     * @param uploader User ID who uploaded the video
     * @return Thumbnail URL or null if failed
     */
    public String generateThumbnail(String videoPath, String uploader) {
        try {
            log.info("Generating thumbnail for video: {}", videoPath);
            log.info("Uploader: {}", uploader);
            
            // Create thumbnail directory if not exists
            Path thumbnailDir = Paths.get(uploadDir, "thumbnailImage", uploader);
            log.info("Creating thumbnail directory: {}", thumbnailDir.toAbsolutePath());
            Files.createDirectories(thumbnailDir);
            
            // Generate unique filename for thumbnail
            String thumbnailFilename = UUID.randomUUID().toString() + ".png";
            Path thumbnailPath = thumbnailDir.resolve(thumbnailFilename);
            log.info("Thumbnail path: {}", thumbnailPath.toAbsolutePath());
            
            // Create a proper thumbnail image using Java AWT
            try {
                // Create a 360x640 image (9:16 aspect ratio for vertical video)
                int width = 360;
                int height = 640;
                BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
                Graphics2D g2d = image.createGraphics();
                
                // Fill with dark gray background
                g2d.setColor(new Color(45, 45, 45));
                g2d.fillRect(0, 0, width, height);
                
                // Draw a play icon in the center
                g2d.setColor(new Color(255, 255, 255, 180));
                int centerX = width / 2;
                int centerY = height / 2;
                int iconSize = 80;
                
                // Draw circle
                g2d.fillOval(centerX - iconSize/2, centerY - iconSize/2, iconSize, iconSize);
                
                // Draw play triangle
                g2d.setColor(new Color(45, 45, 45));
                int[] xPoints = {centerX - 15, centerX - 15, centerX + 20};
                int[] yPoints = {centerY - 20, centerY + 20, centerY};
                g2d.fillPolygon(xPoints, yPoints, 3);
                
                g2d.dispose();
                
                // Save as PNG
                ImageIO.write(image, "png", thumbnailPath.toFile());
                log.info("Thumbnail image created successfully with play icon");
            } catch (Exception e) {
                log.error("Failed to create thumbnail image with AWT, using fallback", e);
                // Fallback: copy placeholder if exists
                Path placeholderPath = Paths.get(uploadDir, "placeholder-thumbnail.png");
                if (Files.exists(placeholderPath)) {
                    Files.copy(placeholderPath, thumbnailPath, StandardCopyOption.REPLACE_EXISTING);
                    log.info("Thumbnail image copied from placeholder");
                } else {
                    // Last resort: create a simple 1x1 PNG
                    byte[] pngBytes = {
                        (byte)0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
                        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
                        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
                        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, (byte)0xC4,
                        (byte)0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
                        0x54, 0x78, (byte)0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
                        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, (byte)0xB4, 0x00,
                        0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, (byte)0xAE,
                        0x42, 0x60, (byte)0x82
                    };
                    Files.write(thumbnailPath, pngBytes);
                    log.info("Simple PNG thumbnail created as last resort");
                }
            }
            
            // Create thumbnail URL
            String thumbnailUrl = "http://" + serverHost + ":" + serverPort + contextPath + 
                                "/files/thumbnailImage/" + uploader + "/" + thumbnailFilename;
            
            log.info("Thumbnail generated successfully: {}", thumbnailUrl);
            return thumbnailUrl;
        } catch (Exception e) {
            log.error("Error generating thumbnail for video: {}", videoPath, e);
            return null;
        }
    }

    /**
     * Delete thumbnail file
     * @param thumbnailPath Path to thumbnail file
     */
    public void deleteThumbnail(String thumbnailPath) {
        try {
            Path path = Paths.get(thumbnailPath);
            if (Files.exists(path)) {
                Files.delete(path);
                log.info("Thumbnail deleted: {}", thumbnailPath);
            }
        } catch (IOException e) {
            log.error("Error deleting thumbnail: {}", thumbnailPath, e);
        }
    }
}
