const deleteProduct = (btn) => {
  const product = btn.parentNode.closest('article');
  const productId = product.querySelector('[name=productId]').value;
  const csrf = product.querySelector('[name=_csrf]').value;

  fetch(`/admin/product/${productId}`, {
    method: 'delete',
    headers: {
      'csrf-token': csrf,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      product.parentNode.removeChild(product);
    })
    .catch(console.log);
};
