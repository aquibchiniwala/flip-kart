function addProduct(){
    $.post('/product',{
        name: $('#productName').val() != '' ? $('#productName').val() : undefined,
        price: $('#productPrice').val() != '' ? $('#productPrice').val() : undefined,
        VendorId: $('#vendorList :selected').val() != '' ? $('#vendorList :selected').val() : undefined
    }).then((data)=>{
        if (data.success) {
            getAllProducts();
            reset();
        } else {
            console.log(data.errorMsg);
        }
    })
}

async function populateVendors() {
     await $.get('/getvendors', (data) => {
        data.sort((a, b) => {
            if (a.name < b.name)
                return -1
            else
                return 1
        }
        );
        Vendors=data;

        for (let vendor of data) {
            $('#vendorList').append(
                `
                <option value="${vendor.id}">${vendor.name}</option>
                `
            )
        }
    })
}

function getAllProducts(){
    $.get('/getproducts', (data) => {
        $('#productList').empty();
        data.sort((a, b) => {
            if (a.name < b.name)
                return -1
            else
                return 1
        }
        );
        for (let product of data) {
            $('#productList').append(
                `<tr>
                    <td>
                        ${product.name}
                    </td>
                    <td>
                        ${product.price}
                    </td>
                    <td>
                        ${product.Vendor?product.Vendor.name:''}
                    </td>
                    <td>
                        <button id="${product.id}" onclick="deleteProduct(this.id)">Delete</button>
                    </td>
                </tr>`
            )
        }
    });
}

function deleteProduct(id){
    $.post('/deleteproduct',{
        id:id
    }).then((data) => {
        if (data.success) {
            getAllProducts();
        } else {
            console.log(data.errorMsg);
        }
    });
}

function reset(){
    $('#productName').val('');
    $('#productPrice').val('');
    $('#vendorList').prop('selectedIndex',0);
}

$(()=>{
    $('#btnAdd').click(addProduct)

    populateVendors().then(()=>{
        getAllProducts();
    })

    
});
