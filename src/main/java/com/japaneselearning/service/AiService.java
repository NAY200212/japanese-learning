package com.japaneselearning.service;

import java.util.Map;

/**
 * AI アシスタントサービス：DeepSeek（Spring AI OpenAI 互換プロトコル）による 3 つの機能。
 * 入出力は Map に統一。フィールドの意味は AiController の Swagger 注釈を参照。
 */
public interface AiService {

    /**
     * 誤答解析：questionId があればバックエンドが問題番号から問題を取得（問題文/選択肢/正解）。無ければリクエスト内の
     * content(+options) + userAnswer + correctAnswer で問題文を組み立てる。
     * @return DeepSeek が生成した解説テキスト（日本語解説/中国語説明/誤答原因分析を含む）
     */
    String analyzeWrongQuestion(Map<String, Object> req);

    /**
     * 単語の例文生成：word 必須（日本語表記）。wordId があれば辞書の意味・レベル文脈を付与。
     * @return 自然な例文 2〜3 個（仮名ルビ + 中国語訳を含む）
     */
    String wordExamples(Map<String, Object> req);

    /**
     * 文法 Q&A：question は任意の日本語文法・構文の質問。
     * @return 解説 + 例文 + 使い分け
     */
    String askGrammar(Map<String, Object> req);
}
