export function getPageNumbers(
  currentPage: number,
  totalPages: number
): (number | string)[] {
  const pageNumbers: (number | string)[] = [];
  const maxPagesToShow = 5;
  const half = Math.floor(maxPagesToShow / 2);

  let startPage = Math.max(1, currentPage - half);
  let endPage = Math.min(totalPages, currentPage + half);

  if (endPage - startPage + 1 < maxPagesToShow) {
    if (startPage === 1) {
      endPage = Math.min(totalPages, maxPagesToShow);
    } else if (endPage === totalPages) {
      startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }
  }

  if (startPage > 1) {
    pageNumbers.push("...");
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  if (endPage < totalPages) {
    pageNumbers.push("...");
  }

  return pageNumbers;
}
