const electron = require('electron');
const { ipcRenderer } = electron;

checkTodoCount();

const todoValue = document.querySelector('#todoValue');
const addBtn = document.querySelector('#addBtn');

ipcRenderer.on('initApp', (e, todos) => {
    todos.forEach(todo => {
        drawRow(todo);
    });
})

todoValue.addEventListener('keypress', e => {
    if (e.keyCode == 13) {
        ipcRenderer.send('newTodo:save', { ref: 'main', todoValue: e.target.value });
        e.target.value = '';
    }
})

addBtn.addEventListener('click', () => {
    ipcRenderer.send('newTodo:save', { ref: 'main', todoValue: todoValue.value });
    todoValue.value = '';
})

ipcRenderer.on('todo:addItem', (e, todo) => {
    drawRow(todo);
});

function checkTodoCount() {
    const container = document.querySelector('.todo-container');
    const alertContainer = document.querySelector('.alert-container');

    let count = container.children.length;


    if (count !== 0) {
        alertContainer.style.display = 'none';
    }
    else {
        alertContainer.style.display = 'block';
    }

    document.querySelector('.total-count-container').innerText = count;
}

function drawRow(todo) {
    //container
    const container = document.querySelector('.todo-container');

    // row
    const row = document.createElement('div');
    row.className = 'row';

    // col
    const col = document.createElement('div');
    col.className = 'todo-item p-2 mb-3 text-light bg-dark col-md-12 shadow card d-flex justify-content-center flex-row align-items-center';

    // p
    const p = document.createElement('p');
    p.className = 'm-0 w-100';
    p.innerText = todo.text;

    // deleteBtn
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-outline-danger flex-shrink-1';
    deleteBtn.innerText = 'X';
    deleteBtn.setAttribute('data-id', todo.id);

    deleteBtn.addEventListener('click', (e) => {
        // if (confirm('Bu kaydı silmek istediğinizden eminmisiniz?')) {
        //     e.target.parentNode.remove();
        //     checkTodoCount();
        // }
        e.target.parentNode.remove();
        ipcRenderer.send('remove:todo', e.target.getAttribute('data-id'));
        checkTodoCount();

    });

    col.appendChild(p);
    col.appendChild(deleteBtn);

    row.appendChild(col);

    container.appendChild(row);

    checkTodoCount();
}
