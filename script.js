const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player1 = {
    x: 140, 
    y: 185, 
    width: 30, 
    height: 30, 
    color: 'red', 
    speed: 30, 
    rotation: 0 
};

const player2 = {
    x: 230,
    y: 185,
    width: 30,
    height: 30, 
    color: 'blue', 
    speed: 20, 
    rotation: 0 
};

const circle = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 150,
    color: '#333'
};

 // Load the background image for the circle
 const circleImage = new Image();
 circleImage.src = "dojo.jpg"; // Replace with your image path

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
    resetGame();
}

function runCommands() {
    if (isExecuting) return;
    commandsQueue = Array.from(programmingArea.children).map(block => block.dataset.command);
    console.log('Running commands:', commandsQueue);
    isExecuting = true;
    executeCommands();
}

circleImage.onload = () => {
    draw(); // Start the game loop when the image is loaded
};

function isInsideCircle(player) {
    const dx = Math.abs(player.x + player.width / 2 - circle.x);
    const dy = Math.abs(player.y + player.height / 2 - circle.y);
    const distanceToEdge = Math.sqrt(dx * dx + dy * dy) + Math.max(player.width, player.height) / 2;
    return distanceToEdge <= circle.radius;
    
}

function declareWinner(winner) {
    alert(`Player ${winner} wins!`);
    resetGame();
}


function resetGame() {
    player1.x = 140;
    player1.y = 185;
    player1.dx = 0;
    player1.dy = 0;
    player1.rotation = 0;

    player2.x = 230;
    player2.y = 185;
    player2.dx = 0;
    player2.dy = 0;
    player2.rotation = 0;
    isExecuting = false;
    draw(); // Start the game loop when the image is loaded
}

draw();

// Detect collision between two players
function arePlayersColliding() {
    return (
        player1.x < player2.x + player2.width &&
        player1.x + player1.width > player2.x &&
        player1.y < player2.y + player2.height &&
        player1.y + player1.height > player2.y
    );
}

// Handle collision resolution and allow players to push each other
function resolveCollision() {
    const overlapX = Math.min(
        player1.x + player1.width - player2.x,
        player2.x + player2.width - player1.x
    );
    const overlapY = Math.min(
        player1.y + player1.height - player2.y,
        player2.y + player2.height - player1.y
    );

    if (overlapX < overlapY) {
        if (player1.x < player2.x) {
            player1.x -= overlapX / 2;
            player2.x += overlapX / 2;
        } else {
            player1.x += overlapX / 2;
            player2.x -= overlapX / 2;
        }
    } else {
        if (player1.y < player2.y) {
            player1.y -= overlapY / 2;
            player2.y += overlapY / 2;
        } else {
            player1.y += overlapY / 2;
            player2.y -= overlapY / 2;
        }
    }
}

function slide(player, distance) {
    const steps = 20;
    const stepX = (distance * Math.cos((Math.PI / 180) * player.rotation)) / steps;
    const stepY = (distance * Math.sin((Math.PI / 180) * player.rotation)) / steps;
    let currentStep = 0;

    function step() {
        if (currentStep >= steps) {
            executeCommands();
            return;
        }

        const originalX = player.x;
        const originalY = player.y;

        player.x += stepX;
        player.y += stepY;

        // Check collisions
        if (arePlayersColliding()) {
            resolveCollision();
        }

        currentStep++;
        draw();
        requestAnimationFrame(step);
    }
    if (!isInsideCircle(player1))
        {
        declareWinner(2);
        isExecuting = false;
        return;
        }
     if (!isInsideCircle(player2))
        {
        declareWinner(1);
        isExecuting = false;
        return;
        } 
    step();
}

function executeCommands() {
    if (commandsQueue.length === 0) {
        isExecuting = false;
        return;
    }
    if (!isInsideCircle(player1))            {
        declareWinner(2);
        isExecuting = false;
        return;
        }

    if (!isInsideCircle(player2))
        {
        declareWinner(1);
        isExecuting = false;
        return;
        } 

    const command = commandsQueue.shift();

    if (command === 'up' || command === 'down') {
        const distance = command === 'up' ? player1.speed : -player1.speed;
        slide(player1, distance);
    } else if (command === 'rotate15left') {
        player1.rotation -= 15;
        if (!isInsideCircle(player1))            {
            declareWinner(2);
            isExecuting = false;
            return;
            }
        if (!isInsideCircle(player2))  if (!isInsideCircle(player2))
            {
            declareWinner(1);
            isExecuting = false;
            return;
            } 
        executeCommands();
    } else if (command === 'rotate15right') {
        player1.rotation += 15;
        if (!isInsideCircle(player1))            {
            declareWinner(2);
            isExecuting = false;
            return;
            }
        if (!isInsideCircle(player2))  if (!isInsideCircle(player2))
            {
            declareWinner(1);
            isExecuting = false;
            return;
            } 
        executeCommands();
    } else if (command === 'rotate45left') {
        player1.rotation -= 45;
        if (!isInsideCircle(player1))            {
            declareWinner(2);
            isExecuting = false;
            return;
            }
        if (!isInsideCircle(player2))  if (!isInsideCircle(player2))
            {
            declareWinner(1);
            isExecuting = false;
            return;
            } 
        executeCommands();
    } else if (command === 'rotate45right') {
        player1.rotation += 45;
        if (!isInsideCircle(player1))            {
            declareWinner(2);
            isExecuting = false;
            return;
            }
        if (!isInsideCircle(player2))  if (!isInsideCircle(player2))
            {
            declareWinner(1);
            isExecuting = false;
            return;
            } 
        executeCommands();
    } else if (command === 'rotate90left') {
        player1.rotation -= 90;
        if (!isInsideCircle(player1))            {
            declareWinner(2);
            isExecuting = false;
            return;
            }
        if (!isInsideCircle(player2))  if (!isInsideCircle(player2))
            {
            declareWinner(1);
            isExecuting = false;
            return;
            } 
        executeCommands();
    } else if (command === 'rotate90right') {
        player1.rotation += 90;
        if (!isInsideCircle(player1))            {
            declareWinner(2);
            isExecuting = false;
            return;
            }
        if (!isInsideCircle(player2))  if (!isInsideCircle(player2))
            {
            declareWinner(1);
            isExecuting = false;
            return;
            } 
        executeCommands();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(circleImage, circle.x - circle.radius, circle.y - circle.radius, circle.radius * 2, circle.radius * 2);
    ctx.restore();

    ctx.save();
    ctx.translate(player1.x + player1.width / 2, player1.y + player1.height / 2);
    ctx.rotate((Math.PI / 180) * player1.rotation);
    ctx.fillStyle = player1.color;
    ctx.fillRect(-player1.width / 2, -player1.height / 2, player1.width, player1.height);
    ctx.restore();

    ctx.save();
    ctx.translate(player2.x + player2.width / 2, player2.y + player2.height / 2);
    ctx.rotate((Math.PI / 180) * player2.rotation);
    ctx.fillStyle = player2.color;
    ctx.fillRect(-player2.width / 2, -player2.height / 2, player2.width, player2.height);
    ctx.restore();
}

circleImage.onload = () => {
    draw();
};
