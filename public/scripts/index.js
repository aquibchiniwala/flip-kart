$(() => {
    $('#frmUser').submit((e) => {
        e.preventDefault();
    });

    (async()=>{
        await populateProducts();

        if($.session.get("user")){
            populateTickers(await getCartItems(false));
            updateCartQty();
            setupLoginGUI();
        }
    })()
    

})