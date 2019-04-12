async function incrementBtn(e) {
    $('#' + e.id).prev().val(parseInt($('#' + e.id).prev().val()) + 1);
    await addToCart(e);
    await getCartItems()
}

async function decrementBtn(e) {
    if ($('#' + e.id).next().val() > 1) {
        $('#' + e.id).next().val(parseInt($('#' + e.id).next().val()) - 1);
    }
    await reduceFromCart(e);
    await getCartItems()
    if ($('#' + e.id).next().val() == 0) {
        $('#' + e.id.substring(8)).closest('tr').remove();
    }
}

function insertIncDecBtn(e, qty = 1) {
    $('#' + e.id).replaceWith(
        `
        <button class="myButton decButton" id="btnMinus${e.id}" onclick="decrementBtn(this)"><i class="fa fa-minus" aria-hidden="true"></i></button>
        <input type="number" id=${e.id} value="${qty}" class="qtyBox">
        <button class="myButton incButton" id="btnPlus${e.id}" onclick="incrementBtn(this)"><i class="fa fa-plus" aria-hidden="true"></i></button>
        `
    );
}

function addToCartBtn(e) {
    let id = (e.id).substring(8);
    $('#btnMinus' + id).remove();
    $('#btnPlus' + id).remove();
    $('#' + id).replaceWith(
        `
        <a class="ad-btn" href="#" onclick="addToCart(this)" id="${id}">Add to Cart</a>
        `
    )

}

async function addToCart(product) {

    let id = (product.id).substring(0, 7) == 'btnPlus' ? (product.id).substring(7) : product.id
    const user = getSession();
    console.log("user", user);
    await $.post('/addtocart', {
        ProductId: id,
        UserId: user.id
    }).then(() => {
        updateCartQty();
        let id = (product.id).substring(7);
        if (!($('#btnPlus' + id).length && $('#btnMinus' + id).length)) {
            insertIncDecBtn(product);
        }
    })
}

async function reduceFromCart(product) {
    let id = (product.id).substring(0, 8) == 'btnMinus' ? (product.id).substring(8) : product.id

    const user = getSession();
    console.log("user", user);
    await $.post('/reducecartqty', {
        ProductId: id,
        UserId: user.id
    }).then((data) => {
        updateCartQty();
        if (data.deleted) {
            addToCartBtn(product);
        }
    })
}

function deleteFromCart(productId) {
    const user = getSession();
    $.post('/deletecartitem', {
        ProductId: productId,
        UserId: user.id
    }).then((data) => {
        getCartItems();
    })
}


function updateCartQty() {
    $.get('/getcartqty/' + getSession().id, (data) => {
        $('#cartQty').html(data.quantity ? data.quantity : 0);
    })
}

function getCartTotal() {
    $.get('/getcarttotal/' + getSession().id, (data) => {
        $('#total').html(data.total);
    })
}

async function getCartItems(populate = true) {
    let items;
    await $.get('/getcartitems/' + getSession().id, (data) => {
        if (populate) {
            populateCart(data);
        }
        items = data;
    })
    //getCartTotal();
    return items;
}

function populateCart(products) {
    let total = 0;
    $('#productList').empty();
    for (let item of products) {
        $('#productList').append(
            `
        <tr>
            <td data-th="Product">
                <div class="row">
                    <div class="col-sm-2 hidden-xs"  ><img src="./assets/car.jfif" alt="..."
                            class="img-responsive" height="50px" width="100px" /></div>
                    <div class="col-sm-10" style="margin-left:10px">
                        <h4 class="nomargin">${item.Product.name}</h4>
                    </div>
                </div>
            </td>
            <td data-th="Price">₹${item.Product.price}</td>
            <td data-th="Quantity">
                <button class="myButton decButton" id="btnMinus${item.Product.id}" onclick="decrementBtn(this)"><i class="fa fa-minus" aria-hidden="true"></i></button>
                <input type="number" id=${item.Product.id} value="${item.quantity}" class="qtyBox">
                <button class="myButton incButton" id="btnPlus${item.Product.id}" onclick="incrementBtn(this)"><i class="fa fa-plus" aria-hidden="true"></i></button>
            </td>
            <td data-th="Subtotal" class="text-center" id="subTotal+${item.Product.id}">${item.Product.price * item.quantity}</td>
            <td class="actions" data-th="">
                <button id="${item.ProductId}" class="btn btn-danger btn-sm" onclick="deleteFromCart(this.id)"><i class="fa fa-trash"></i></button>
            </td>
        </tr>
                `
        )
        total += item.Product.price * item.quantity;
        $('.myButton').click(updateTotals(item));

    }
    $('#total').empty().append('Total ₹ ' + total);
    if (products.length == 0) {
        $('#productList').append(
            `
                <h2>No items in the cart.</h2>
            `
        )
        $('#btnCheckOut').addClass('disableDiv');
    }
}


function updateTotals(product) {
    console.log("muObj", (product));
    $('#subTotal' + product.ProductId).val($('#' + product.ProductId).val() * $('#' + product.Product.price).val());
}