const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player1 = {
    x: 200, 
    y: 200, 
    width: 30, 
    height: 30, 
    color: 'red', 
    speed: 10, 
    rotation: 0 
};

const circle = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 150,
    color: '#333'
};

const programmingArea = document.getElementById('programmingArea');

let commandsQueue = [];
let isExecuting = false;

let draggedBlock = null;

document.querySelectorAll('.block').forEach(block => {
    block.addEventListener('dragstart', (e) => {
        draggedBlock = e.target;
        draggedBlock.classList.add('dragging');
    });

    block.addEventListener('dragend', () => {
        draggedBlock.classList.remove('dragging');
        draggedBlock = null;
    });
});

programmingArea.addEventListener('dragover', (e) => {
    e.preventDefault();
});

programmingArea.addEventListener('drop', (e) => {
    e.preventDefault();
    if (draggedBlock) {
        const clone = draggedBlock.cloneNode(true);
        clone.addEventListener('click', () => {
            programmingArea.removeChild(clone);
        });
        programmingArea.appendChild(clone);
    }
});

function resetProgrammingArea() {
    programmingArea.innerHTML = '';
    commandsQueue = [];
    isExecuting = false;
}

function runCommands() {
    if (isExecuting) return;
    commandsQueue = Array.from(programmingArea.children).map(block => block.dataset.command);
    console.log('Running commands:', commandsQueue);
    isExecuting = true;
    executeCommands();
}

function executeCommands() {
    if (commandsQueue.length === 0) {
        isExecuting = false;
        return;
    }

    const command = commandsQueue.shift();

    if (command === 'up' || command === 'down') {
        const distance = command === 'up' ? player1.speed : -player1.speed;
        slide(distance);
    } else if (command === 'rotate15left') {
        player1.rotation -= 15;
        executeCommands();
    } else if (command === 'rotate15right') {
        player1.rotation += 15;
        executeCommands();
    } else if (command === 'rotate45left') {
        player1.rotation -= 45;
        executeCommands();
    } else if (command === 'rotate45right') {
        player1.rotation += 45;
        executeCommands();
    } else if (command === 'rotate90left') {
        player1.rotation += 90;
        executeCommands();
    } else if (command === 'rotate90right') {
        player1.rotation += 90;
        executeCommands();
    }
}

function slide(distance) {
    const steps = 20; 
    const stepX = (distance * Math.cos((Math.PI / 180) * player1.rotation)) / steps;
    const stepY = (distance * Math.sin((Math.PI / 180) * player1.rotation)) / steps;
    let currentStep = 0;

    function step() {
        if (currentStep >= steps) {
            executeCommands();
            return;
        }

        player1.x += stepX;
        player1.y += stepY;
        currentStep++;
        draw();
        requestAnimationFrame(step);
    }

    step();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = circle.color;
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(player1.x + player1.width / 2, player1.y + player1.height / 2);
    ctx.rotate((Math.PI / 180) * player1.rotation);
    ctx.fillStyle = player1.color;
    ctx.fillRect(-player1.width / 2, -player1.height / 2, player1.width, player1.height);
    ctx.restore();
}

draw();
