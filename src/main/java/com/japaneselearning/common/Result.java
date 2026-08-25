package com.japaneselearning.common;

import lombok.Data;

@Data
public class Result<T> {
    private Integer code;   //1=成功 0=失败
    private String message; //提示信息
    private T data;         //返回的数据

    //成功(带数据)
    public static <T> Result<T> success(T data) {
        Result<T> r = new Result<T>();
        r.setCode(1);
        r.setMessage("success");
        r.setData(data);
        return r;
    }

    //成功(不带数据)
    public static <T> Result<T> success(){
        return success(null);
    }

    //失败
    public static <T> Result<T> error(String message) {
        Result<T> r = new Result<T>();
        r.setCode(0);
        r.setMessage(message);
        return r;
    }


}
