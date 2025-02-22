function mkDialog(title: string, message: string, option: Array<string> = ["确定"]): Promise<Number>{
    const modalDiv = document.querySelector("#modal") as HTMLDivElement;
    let optionHTML = "";
    for(let i = 0; i < option.length; i++){
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
    `
    let myModal = new bootstrap.Modal(modalDiv);
    myModal.show();
    return new Promise((resolve, reject) => {
        for(let i = 0; i < option.length; i++){
            document.querySelector(`#modalOption${i}`)?.addEventListener("click", () => {
                myModal.hide();
                resolve(i);
            });
        }
    });
}