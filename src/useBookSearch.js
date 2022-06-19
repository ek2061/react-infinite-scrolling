import axios from "axios";
import React from "react";

export default function useBookSearch(query, pageNumber) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [books, setBooks] = React.useState([]);
  const [hasMore, setHasMore] = React.useState(false);

  React.useEffect(() => {
    // 文本框每次輸入時清空搜尋結果
    setBooks([]);
  }, [query]);

  React.useEffect(() => {
    setLoading(true);
    setError(false);
    let cancel;
    axios({
      method: "GET",
      url: "https://openlibrary.org/search.json",
      params: { q: query, page: pageNumber },
      // 因為文本框每修改一個字(onChange)都會發送請求，所以最新的請求應該要去取消上一次送出的請求，功能如同 fetch above
      cancelToken: new axios.CancelToken((c) => (cancel = c)),
    })
      .then((res) => {
        setBooks((prevBooks) => {
          // 成功的話返回(原資料 + 新資料的 title)，且要不重複
          return [
            ...new Set([...prevBooks, ...res.data.docs.map((b) => b.title)]),
          ];
        });
        setHasMore(res.data.docs.length > 0);
        setLoading(false);
      })
      .catch((e) => {
        // axios cancel後會有無法捕獲 Promise 的錯誤，要在catch擋掉
        if (axios.isCancel(e)) return;

        // 如果不是 axios cancel 的錯誤就是真的錯誤
        setError(true);
      });
    return () => cancel();
  }, [query, pageNumber]);
  return { loading, error, books, hasMore };
}
