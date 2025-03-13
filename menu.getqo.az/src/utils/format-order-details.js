export function formatOrderDetails(order) {
  const paidItems = [];
  const unpaidItems = [];
  const totalPaidAmount =
    order?.transactions?.reduce((acc, item) => {
      if ("children" in item && item.children.length > 0) {
        return (
          item.children.reduce((acc, item) => {
            if (item.status === "paid") {
              return acc + item.price;
            }
            return acc;
          }, 0) ?? 0
        );
      }
      if (item.status === "paid") {
        return acc + item.price;
      }
      return acc;
    }, 0) ?? 0;
  const isAllPorductsPaid = order?.details?.every(
    (item) => item.transaction_status === "paid",
  );

  const isAllTransactionLinksPaid = (() => {
    const transactionLinks = order?.transactions?.reduce((acc, item) => {
      if ("children" in item && item.children.length > 0) {
        return [...acc, ...item.children];
      }
      return [...acc, item];
    }, []);

    return transactionLinks?.every((item) => item.status === "paid");
  })();

  const isAllTransactionsPaid = isAllPorductsPaid && isAllTransactionLinksPaid;

  order?.details?.forEach((item) => {
    if (item?.transaction_status === "paid") {
      paidItems.push(item);
    } else {
      unpaidItems.push(item);
    }
  });

  return {
    paidItems,
    unpaidItems,
    totalPaidAmount,
    isAllTransactionsPaid,
  };
}
