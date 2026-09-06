package com.japaneselearning.common;

import lombok.Data;

@Data
public class Result<T> {
    private Integer code;   //1=成功 0=失敗
    private String message; //提示メッセージ
    private T data;         //返却データ

    //成功（データあり）
    public static <T> Result<T> success(T data) {
        Result<T> r = new Result<T>();
        r.setCode(1);
        r.setMessage("success");
        r.setData(data);
        return r;
    }

    //成功（データなし）
    public static <T> Result<T> success(){
        return success(null);
    }

    //失敗
    public static <T> Result<T> error(String message) {
        Result<T> r = new Result<T>();
        r.setCode(0);
        r.setMessage(message);
        return r;
    }


}
