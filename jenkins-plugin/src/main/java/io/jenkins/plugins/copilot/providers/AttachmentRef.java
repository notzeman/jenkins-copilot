package io.jenkins.plugins.copilot.providers;

/** A stored image attachment referenced by a message. */
public class AttachmentRef {
    private String id;
    private String mediaType;
    private String fileName;
    private long size;

    public AttachmentRef() {}

    public AttachmentRef(String id, String mediaType, String fileName, long size) {
        this.id = id;
        this.mediaType = mediaType;
        this.fileName = fileName;
        this.size = size;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMediaType() {
        return mediaType;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }
}
