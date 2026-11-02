package io.jenkins.plugins.copilot.ops;

/** An expected, user-facing operation failure with an HTTP-ish status. */
public class OperationException extends Exception {

    private final String code;
    private final int status;

    public OperationException(String code, int status, String message) {
        super(message);
        this.code = code;
        this.status = status;
    }

    public OperationException(String code, int status, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
        this.status = status;
    }

    public String getCode() {
        return code;
    }

    public int getStatus() {
        return status;
    }

    public static OperationException invalid(String message) {
        return new OperationException("invalid_argument", 400, message);
    }

    public static OperationException forbidden(String message) {
        return new OperationException("forbidden", 403, message);
    }

    public static OperationException notFound(String message) {
        return new OperationException("not_found", 404, message);
    }

    public static OperationException conflict(String message) {
        return new OperationException("conflict", 409, message);
    }

    public static OperationException unsupported(String message) {
        return new OperationException("unsupported", 422, message);
    }
}
