import React from "react";
import useBookSearch from "./useBookSearch";

export default function App() {
  const [query, setQuery] = React.useState("");
  const [pageNumber, setPageNumber] = React.useState(1);

  const { loading, error, books, hasMore } = useBookSearch(query, pageNumber);

  const observer = React.useRef();
  const lastBookElementRef = React.useCallback(
    (node) => {
      // 如果正在加載就不要再加載了，避免觸發無限滾動
      if (loading) return;

      // 如果已有觀察者就斷開，因為要重新連接觀察者
      if (observer.current) observer.current.disconnect();

      // 檢查視窗內是否有最後一筆資料的 ref
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPageNumber((prevPageNumber) => prevPageNumber + 1);
        }
      });

      // 加入要觀察的目標(最後一筆資料的 ref)
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const handleSearch = (e) => {
    setQuery(e.target.value);
    setPageNumber(1);
  };

  return (
    <>
      <h1>Book Search</h1>
      <input type="text" onChange={handleSearch} value={query}></input>
      {books.map((book, index) => {
        if (index === books.length - 1) {
          // 在最後一筆資料加入 ref
          return (
            <div ref={lastBookElementRef} key={book}>
              {book}
            </div>
          );
        } else {
          return <div key={book}>{book}</div>;
        }
      })}
      {loading && <div>Loading...</div>}
      {error && <div>Error</div>}
    </>
  );
}
