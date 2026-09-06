package com.japaneselearning.common;

import lombok.Data;
import java.util.List;

@Data
public class PageResult<T> {
    private List<T> list;       // 現在ページのデータ
    private long total;         // 総件数
    private int page;           // 現在のページ番号
    private int size;           // 1 ページあたりの件数
    private int totalPages;     // 総ページ数

    public PageResult(List<T> list, long total, int page, int size) {
        this.list = list;
        this.total = total;
        this.page = page;
        this.size = size;
        this.totalPages = (int) Math.ceil((double) total / size);
    }
}
