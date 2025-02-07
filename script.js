const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player1 = {
  x: 0,
  y: 155,
  width: 65,
  height: 65,
  speed: 30,
  rotation: 0,
};

// Load the background image for player
const player1Image = new Image();
player1Image.src = "Robolego1.png"; // Replace with your image path

const player2Image = new Image();
player2Image.src = "Robolego2.png"; // Replace with your image path

const player2 = {
  x: 230,
  y: 185,
  width: 65,
  height: 65,
  speed: 20,
  rotation: 0,
};

const circle = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 150,
  color: "#333",
};

// Load the background image for the circle
const circleImage = new Image();
circleImage.src = "dojo.jpg"; // Replace with your image path

const programmingArea = document.getElementById("programmingArea");

let commandsQueue = [];
let isExecuting = false;

let draggedBlock = null;

document.querySelectorAll(".block").forEach((block) => {
  block.addEventListener("dragstart", (e) => {
    draggedBlock = e.target;
    draggedBlock.classList.add("dragging");
  });

  block.addEventListener("dragend", () => {
    draggedBlock.classList.remove("dragging");
    draggedBlock = null;
  });
});

programmingArea.addEventListener("dragover", (e) => {
  e.preventDefault();
});

programmingArea.addEventListener("drop", (e) => {
  e.preventDefault();
  if (draggedBlock) {
    const clone = draggedBlock.cloneNode(true);
    clone.addEventListener("click", () => {
      programmingArea.removeChild(clone);
    });
    programmingArea.appendChild(clone);
  }
});

function resetProgrammingArea() {
  programmingArea.innerHTML = "";
  commandsQueue = [];
  isExecuting = false;
}

function runCommands() {
  if (isExecuting) return;
  commandsQueue = Array.from(programmingArea.children).map(
    (block) => block.dataset.command
  );
  console.log("Running commands:", commandsQueue);
  isExecuting = true;
  executeCommands();
}

circleImage.onload = () => {
  draw(); // Start the game loop when the image is loaded
};
player1Image.onload = () => {
  draw(); // Start the game loop when the image is loaded
};
player2Image.onload = () => {
  draw(); // Start the game loop when the image is loaded
};

function isInsideCircle(player) {
  const dx = Math.abs(player.x + player.width / 2 - circle.x);
  const dy = Math.abs(player.y + player.height / 2 - circle.y);
  const distanceToEdge =
    Math.sqrt(dx * dx + dy * dy) + Math.max(player.width, player.height) / 2;
  return distanceToEdge <= circle.radius;
}

function declareWinner(winner) {
  const winnerText = document.getElementById("winnerText");

  // Exibe o vencedor com base no parâmetro 'winner'
  winnerText.textContent = `Jogador ${winner} Ganhou!`;

  const modal = document.getElementById("winnerModal");
  modal.style.display = "flex"; // Exibe o modal

  // Opção de reiniciar o jogo (caso queira adicionar a lógica)

}

function closeModal() {
  const modal = document.getElementById("winnerModal");
  modal.style.display = "none"; // Fecha o modal
  resetGame();
}

function resetGame() {
  player1.x = 105;
  player1.y = 168;
  player1.dx = 0;
  player1.dy = 0;
  player1.rotation = 0;

  player2.x = 230;
  player2.y = 168;
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
function rotatePlayer(player, targetRotation) {
  return new Promise((resolve) => {
    const steps = 5; // Número de frames para suavizar a rotação
    const stepRotation = (targetRotation - player.rotation) / steps;
    let currentStep = 0;

    function step() {
      if (currentStep >= steps) {
        // Verifica se os jogadores ainda estão dentro do círculo antes de iniciar o movimento
        if (!isInsideCircle(player1)) {
          declareWinner(2);
          return;
        }

        if (!isInsideCircle(player2)) {
          declareWinner(1);
          return;
        }

        player.rotation = targetRotation;
        resolve();
        return;
      }

      player.rotation += stepRotation;
      currentStep++;
      draw(); // Atualiza o canvas
      requestAnimationFrame(step);
    }
    // Verifica se os jogadores ainda estão dentro do círculo antes de iniciar o movimento
    if (!isInsideCircle(player1)) {
      declareWinner(2);
      return;
    }

    if (!isInsideCircle(player2)) {
      declareWinner(1);
      return;
    }

    step();
  });
}

function getHitbox(player) {
  return {
    front: {
      x: player.x + player.width * 0.35,
      y: player.y,
      width: player.width * 0.3,
      height: player.height * 0.2,
    },
    back: {
      x: player.x + player.width * 0.35,
      y: player.y + player.height * 0.8,
      width: player.width * 0.3,
      height: player.height * 0.2,
    },
    left: {
      x: player.x,
      y: player.y + player.height * 0.35,
      width: player.width * 0.2,
      height: player.height * 0.3,
    },
    right: {
      x: player.x + player.width * 0.8,
      y: player.y + player.height * 0.35,
      width: player.width * 0.2,
      height: player.height * 0.3,
    },
  };
}

function countCollidingHitboxes(hitbox1, hitbox2) {
  let count = 0;

  for (const key1 in hitbox1) {
    for (const key2 in hitbox2) {
      if (isColliding(hitbox1[key1], hitbox2[key2])) {
        count++;
      }
    }
  }

  return count;
}

// Verifica se duas áreas estão colidindo
function isColliding(box1, box2) {
  return (
    box1.x < box2.x + box2.width &&
    box1.x + box1.width > box2.x &&
    box1.y < box2.y + box2.height &&
    box1.y + box1.height > box2.y
  );
}

// Resolver colisão e permitir que os jogadores empurrem um ao outro
async function resolveCollision() {
  // Verifica se os jogadores ainda estão dentro do círculo antes de iniciar o movimento
  if (!isInsideCircle(player1)) {
    declareWinner(2);
    return;
  }

  if (!isInsideCircle(player2)) {
    declareWinner(1);
    return;
  }

  const hitbox1 = getHitbox(player1);
  const hitbox2 = getHitbox(player2);

  const overlapX = Math.min(
    player1.x + player1.width - player2.x,
    player2.x + player2.width - player1.x
  );
  const overlapY = Math.min(
    player1.y + player1.height - player2.y,
    player2.y + player2.height - player1.y
  );

  const collisionCount1 = countCollidingHitboxes(hitbox1, hitbox2);
  const collisionCount2 = countCollidingHitboxes(hitbox2, hitbox1);

  if (overlapX < overlapY) {
    if (player1.x < player2.x) {
      player1.x -= overlapX / 2;
      player2.x += overlapX / 2;
      if (collisionCount1 === 1)
        await rotatePlayer(player1, player1.rotation + 2);
      if (collisionCount2 === 1)
        await rotatePlayer(player2, player2.rotation + 2);
    } else {
      player1.x += overlapX / 2;
      player2.x -= overlapX / 2;
      if (collisionCount1 === 1)
        await rotatePlayer(player1, player1.rotation + 2);
      if (collisionCount2 === 1)
        await rotatePlayer(player2, player2.rotation + 2);
    }
  } else {
    if (player1.y < player2.y) {
      player1.y -= overlapY / 2;
      player2.y += overlapY / 2;
      if (collisionCount1 === 1)
        await rotatePlayer(player1, player1.rotation - 1);
      if (collisionCount2 === 1)
        await rotatePlayer(player2, player2.rotation + 1);
    } else {
      player1.y += overlapY / 2;
      player2.y -= overlapY / 2;
      if (collisionCount1 === 1)
        await rotatePlayer(player1, player1.rotation + 1);
      if (collisionCount2 === 1)
        await rotatePlayer(player2, player2.rotation - 1);
    }
  }
}

// Função de movimentação com suporte a Promises
function slide(player, distance) {
    if (!isInsideCircle(player1)) {
        declareWinner(2);
        isExecuting = false;
        return;
      }
  
      if (!isInsideCircle(player2)) {
        declareWinner(1);
        isExecuting = false;
        return;
      }
  return new Promise((resolve) => {
    const steps = 60;
    const stepX =
      ((distance + 20) * Math.cos((Math.PI / 180) * player.rotation)) / steps;
    const stepY =
      ((distance + 20) * Math.sin((Math.PI / 180) * player.rotation)) / steps;
    let currentStep = 0;

    function step() {
      if (currentStep >= steps) {
        resolve(); // Movimento concluído
        return;
      }
      // Verifica se os jogadores ainda estão dentro do círculo antes de iniciar o movimento
      if (!isInsideCircle(player1)) {
        declareWinner(2);
        return;
      }

      if (!isInsideCircle(player2)) {
        declareWinner(1);
        return;
      }

      const originalX = player.x;
      const originalY = player.y;

      player.x += stepX;
      player.y += stepY;

      // Verifica colisões
      if (arePlayersColliding()) {
        resolveCollision();
      }

      currentStep++;
      draw(); // Atualiza o canvas
      requestAnimationFrame(step);
    }

    // Verifica se os jogadores ainda estão dentro do círculo antes de iniciar o movimento
    if (!isInsideCircle(player1)) {
      declareWinner(2);
      isExecuting = false;
      return;
    }

    if (!isInsideCircle(player2)) {
      declareWinner(1);
      isExecuting = false;
      return;
    }

    step(); // Inicia o movimento
  });
}

// Função de execução de comandos ajustada
async function executeCommands() {
  if (commandsQueue.length === 0) {
    isExecuting = false;
    return;
  }

  // Verifica se os jogadores estão dentro do círculo
  if (!isInsideCircle(player1)) {
    declareWinner(2);
    isExecuting = false;
    return;
  }

  if (!isInsideCircle(player2)) {
    declareWinner(1);
    isExecuting = false;
    return;
  }

  const command = commandsQueue.shift();

  if (command === "up" || command === "down") {
    const distance = command === "up" ? player1.speed : -player1.speed;
    await slide(player1, distance); // Aguarda a movimentação
  } else if (command.startsWith("rotate")) {
    const rotationSteps = {
      rotate15left: -15,
      rotate15right: 15,
      rotate45left: -45,
      rotate45right: 45,
      rotate90left: -90,
      rotate90right: 90,
    };
    const targetRotation = player1.rotation + rotationSteps[command];
    await animateRotation(
      player1,
      targetRotation,
      Math.sign(rotationSteps[command])
    ); // Aguarda a rotação
  }

  // Verifica novamente se os jogadores estão dentro do círculo
  if (!isInsideCircle(player1)) {
    declareWinner(2);
    isExecuting = false;
    return;
  }

  if (!isInsideCircle(player2)) {
    declareWinner(1);
    isExecuting = false;
    return;
  }

  // Continua com o próximo comando
  executeCommands();
}

// Função de animação de rotação
function animateRotation(player, targetRotation, rotationStep) {
  return new Promise((resolve) => {
    const rotate = () => {
      if (Math.abs(player.rotation - targetRotation) > 1) {
        player.rotation += rotationStep; // Gira o jogador aos poucos
        draw(); // Atualiza o canvas com a nova rotação
        requestAnimationFrame(rotate); // Chama a próxima animação
      } else {
        player.rotation = targetRotation; // Garante que a rotação chegue exatamente no alvo
        draw(); // Redesenha o player no alvo final
        resolve(); // Notifica que a rotação foi concluída
      }
    };
    rotate(); // Inicia a animação
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
  ctx.clip();

  ctx.drawImage(
    circleImage,
    circle.x - circle.radius,
    circle.y - circle.radius,
    circle.radius * 2,
    circle.radius * 2
  );
  ctx.restore();

  ctx.save();
  ctx.translate(player1.x + player1.width / 2, player1.y + player1.height / 2);
  ctx.rotate((Math.PI / 180) * player1.rotation);
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.fillRect(
    -player1.width / 2,
    -player1.height / 2,
    player1.width,
    player1.height
  );
  ctx.drawImage(
    player1Image,
    -player1.width / 2,
    -player1.height / 2,
    player1.width,
    player1.height
  );
  ctx.restore();

  ctx.save();
  ctx.translate(player2.x + player2.width / 2, player2.y + player2.height / 2);
  ctx.rotate((Math.PI / 180) * player2.rotation);
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.fillRect(
    -player2.width / 2,
    -player2.height / 2,
    player2.width,
    player2.height
  );
  ctx.drawImage(
    player2Image,
    -player2.width / 2,
    -player2.height / 2,
    player2.width,
    player2.height
  );
  ctx.restore();
}

circleImage.onload = () => {
  draw();
};

document.addEventListener("DOMContentLoaded", () => {
  resetGame();
  const resetButton = document.getElementById("resetButton");
  const gameCanvas = document.getElementById("gameCanvas");
  const ctx = gameCanvas.getContext("2d");

  // Inicializa o canvas com uma cor de fundo
  ctx.fillStyle = "#d3d3d3";
  ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Função de reset
  resetButton.addEventListener("click", () => {
    resetButton.classList.add("rotating");

    setTimeout(() => {
      resetButton.classList.remove("rotating");

      console.log("Dojo resetado!");
    }, 1000); // Duração da animação
  });

  resetButton.addEventListener("click", () => {
    resetGame();
  });
});

document.getElementById("helpButton").addEventListener("click", function () {
  // Verificar se a janela já está aberta
  if (document.querySelector(".blank-window")) return;

  // Criar a janela amigável
  var blankWindow = document.createElement("div");
  blankWindow.className = "blank-window";

  // Criar o container deslizante
  var slider = document.createElement("div");
  slider.className = "blank-window-slider";

  // Conteúdos da janela em páginas separadas
  var pages = [
    `<img src="bloco_lego.png" alt="Sumô LEGO" width="90">
    <h2>Bem-vindo ao simulador de Sumo LEGO!</h2>
         <p>O Sumo LEGO é uma competição entre robôs programados para empurrar o adversário para fora da arena.</p>`,

    `<img src="engrenagem.png" alt="Sumô LEGO" width="90">
    <h2>Como funciona?</h2>
         <p>No seu simulador, a programação em blocos permite criar lógicas sem precisar escrever código,basta apenas arrastar e soltar os blocos para criar o seu programa.</p>`,

    `<img src="trofeu1.png" alt="Sumô LEGO" width="90">
    <h2>Dicas para vencer</h2>
         <p>Ajuste os motores, configure sensores e desenvolva estratégias para derrotar seus oponentes na arena!</p>`,

    `<img src="programacaoIcon.png" alt="Sumô LEGO" width="90">
    <h2>Área de Programação</h2>
        <p> Arraste os blocos de comando para criar seu programa e execute-o na arena clicando no botão "Executar". Para remover blocos indesejados, basta clicar rapidamente sobre eles ou usar o botão "Limpar".</p>`,
        
    `<img src="recarregar.png" alt="Sumô LEGO" width="90">
    <h2>Resetando Posições</h2>
        <p>Você pode retornar os robôs à posição inicial clicando no botão "Reset", localizado à esquerda do dojo.</p>`,
  ];

  pages.forEach((content) => {
    var page = document.createElement("div");
    page.className = "blank-window-content";
    page.innerHTML = content;
    slider.appendChild(page);
  });

  blankWindow.appendChild(slider);

  // Botões de navegação
  var prevBtn = document.createElement("button");
  prevBtn.className = "prev-btn";
  prevBtn.innerHTML = "◀";

  var nextBtn = document.createElement("button");
  nextBtn.className = "next-btn";
  nextBtn.innerHTML = "▶";

  // Adicionar evento de deslizar
  let index = 0;
  nextBtn.addEventListener("click", () => {
    if (index < pages.length - 1) {
      index++;
      slider.style.transform = `translateX(-${index * 100}%)`;
    }
  });

  prevBtn.addEventListener("click", () => {
    if (index > 0) {
      index--;
      slider.style.transform = `translateX(-${index * 100}%)`;
    }
  });

  blankWindow.appendChild(prevBtn);
  blankWindow.appendChild(nextBtn);

  // Botão de fechar com novo estilo
  var closeButton = document.createElement("div");
  closeButton.className = "close-button";
  closeButton.innerHTML = "&times;";
  closeButton.addEventListener("click", function () {
    document.body.removeChild(blankWindow);
  });

  blankWindow.appendChild(closeButton);

  // Adicionar a janela ao body
  document.body.appendChild(blankWindow);
});
