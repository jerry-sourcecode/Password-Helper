"use strict";
function mkDialog(title, message, option = ["确定"]) {
    const modalDiv = document.querySelector("#modal");
    let optionHTML = "";
    for (let i = 0; i < option.length; i++) {
        optionHTML += `<button type="button" class="btn btn-primary" data-bs-dismiss="modal" id="modalOption${i}">${option[i]}</button>`;
    }
    modalDiv.innerHTML = `
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">${title}</h5>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                ${optionHTML}
            </div>
        </div>
    </div>
    `;
    let myModal = new bootstrap.Modal(modalDiv);
    myModal.show();
    return new Promise((resolve, reject) => {
        var _a;
        for (let i = 0; i < option.length; i++) {
            (_a = document.querySelector(`#modalOption${i}`)) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
                myModal.hide();
                resolve(i);
            });
        }
    });
}
