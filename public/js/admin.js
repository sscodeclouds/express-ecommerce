const deleteProduct = (btn) => {
    const productId = btn.getAttribute("data-product-id");

    fetch('/admin/delete-product/' + productId, {
        method: 'DELETE'
    })
    .then(result => result.json())
    .then(data => {
        console.log(data)
        btn.closest('.product-item').remove();
    })
    .catch(err => console.log(err));
};