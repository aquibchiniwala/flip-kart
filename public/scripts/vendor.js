function getAllVendors() {
    $.get('/getvendors', (data) => {
        $('#vendorList').empty();
        data.sort((a, b) => {
            if (a.name < b.name)
                return -1
            else
                return 1
        }
        );
        for (let vendor of data) {
            $('#vendorList').append(
                `<tr>
                    <td>
                        ${vendor.name}
                    </td>
                    <td>
                        ${vendor.address}
                    </td>
                    <td>
                        <button id="${vendor.id}" onclick="deleteVendor(this.id)">Delete</button>
                    </td>
                </tr>`
            )
        }
    });
}
function deleteVendor(id) {
    $.post('/deletevendor', {
        id: id
    }).then((data) => {
        if (data.success) {
            getAllVendors();
        } else {
            console.log(data.errorMsg);
        }
    });
}
function addVendor() {
    $.post('/vendor',
        {
            name: $('#vendorName').val() != '' ? $('#vendorName').val() : undefined,
            address: $('#vendorAddress').val() != '' ? $('#vendorAddress').val() : undefined
        }
    ).then((data) => {
        if (data.success) {
            getAllVendors();
            reset();
        } else {
            console.log(data.errorMsg);
        }
    })
}
function reset() {
    $('#vendorName').val('');
    $('#vendorAddress').val('');
}

$(() => {
    $('#vendorForm').submit((e) => { e.preventDefault(); });

    $('#btnAdd').click(addVendor);

    getAllVendors();
})