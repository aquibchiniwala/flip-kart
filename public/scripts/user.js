function setSession(user) {
    let jsonUser = JSON.stringify(user);
    $.session.set("user", jsonUser);
}

function getSession() {
    return JSON.parse($.session.get("user"));
}

function login() {
    let user = $('#user').val();
    $.post('/login',
        {
            name: user
        }).then((data) => {
            if (data.success) {
                populateTickers(data.user.Carts);
                setSession(data.user);
                updateCartQty();
                setupLoginGUI();
                $('#user').val('')
            } else {
                console.log(data.errorMsg);
            }
        })
}

function logout(){
    $.session.remove('user');
    populateProducts()
    setupLogoutGUI();
}

function setupLoginGUI(){
    $("#ads").removeClass('disableDiv')
    $("#btnLogout").removeClass('disableDiv')
    $("#user").addClass('disableDiv')
    $("#btnLogin").addClass('disableDiv')
    $("#userName").html('Welecome '+getSession().name)
}
function setupLogoutGUI(){
    $("#ads").addClass('disableDiv')
    $("#btnLogout").addClass('disableDiv')
    $("#user").removeClass('disableDiv')
    $("#btnLogin").removeClass('disableDiv')
    $("#userName").remove();
}

function populateTickers(cartItems) {
    for (let item of cartItems){
        let obj={id:item.ProductId};
        insertIncDecBtn(obj,item.quantity);
    }
}

async function populateProducts() {
    await $.get('/getproducts', (data) => {
        console.log(data, "data");
        data.sort((a, b) => {
            if (a.name < b.name)
                return -1
            else
                return 1
        }
        );
        console.log(data, "data");
        $('#ads').empty().append(
            `
                <span class="input-group-addon" style="margin-left:90% "> <span class="badge" style="font-size:20px"
                        id="cartQty">0</span> <a href="/checkout.html" class="fa fa-shopping-cart"
                        style="font-size:48px;color:red"></a>
                </span>
            `
        );
        for (let product of data) {
            $('#ads').append(
                `
            
            <div class="col-md-4">
                <div class="card rounded">
                    <div class="card-image">
                        <img class="img-fluid" src="./assets/car.jfif" alt="Alternate Text" />
                    </div>
                    <div class="card-image-overlay m-auto">
                        <span class="card-detail-badge">₹${product.price}</span>
                    </div>
                    <div class="card-body text-center">
                        <div class="ad-title m-auto">
                            <h5>${product.name}</h5>
                        </div>
                        <a class="ad-btn" href="#" onclick="addToCart(this)" id="${product.id}">Add to Cart</a>
                    </div>
                </div>
            </div>

            `
            )
        }
    });
}