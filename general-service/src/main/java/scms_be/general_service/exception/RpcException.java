package scms_be.general_service.exception;

import lombok.Getter;

@Getter
public class RpcException extends RuntimeException {

    private final int statusCode;

    public RpcException(int statusCode, String message) {
        super(message);
        this.statusCode = statusCode;
    }

    public RpcException(int statusCode, String message, Throwable cause) {
        super(message, cause);
        this.statusCode = statusCode;
    }
}
