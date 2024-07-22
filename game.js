const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 450;
canvas.height = 440;

const gravity = 0.5;
const friction = 0.8;

const player = {
    x: 50,
    y: 350,
    width: 32,
    height: 32,
    speed: 5,
    velocityX: 0,
    velocityY: 0,
    jumping: false,
    grounded: false
};

const target = {
    x: 10,
    y: 10,
    width: 32,
    height: 32,
};

const keys = {
    left: false,
    right: false,
    up: false
};

const platforms = [
    { x: 0, y: 400, width: 450, height: 50, velocityX: 0 },
    { x: 100, y: 300, width: 100, height: 10, velocityX: Math.random() * 2 + 1 },
    { x: 200, y: 200, width: 100, height: 10, velocityX: Math.random() * 2 + 1 },
    { x: 300, y: 100, width: 100, height: 10, velocityX: Math.random() * 2 + 1 }
];

let messageDisplayed = false;

document.addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft") keys.left = true;
    if (e.code === "ArrowRight") keys.right = true;
    if (e.code === "ArrowUp") keys.up = true;
});

document.addEventListener("keyup", (e) => {
    if (e.code === "ArrowLeft") keys.left = false;
    if (e.code === "ArrowRight") keys.right = false;
    if (e.code === "ArrowUp") keys.up = false;
});

document.getElementById("leftBtn").addEventListener("touchstart", () => keys.left = true);
document.getElementById("leftBtn").addEventListener("touchend", () => keys.left = false);
document.getElementById("rightBtn").addEventListener("touchstart", () => keys.right = true);
document.getElementById("rightBtn").addEventListener("touchend", () => keys.right = false);
document.getElementById("jumpBtn").addEventListener("touchstart", () => keys.up = true);
document.getElementById("jumpBtn").addEventListener("touchend", () => keys.up = false);

function update() {
    if (keys.left) player.velocityX = -player.speed;
    if (keys.right) player.velocityX = player.speed;
    if (keys.up && !player.jumping && player.grounded) {
        player.jumping = true;
        player.grounded = false;
        player.velocityY = -player.speed * 2;
    }

    player.velocityY += gravity;
    player.x += player.velocityX;
    player.y += player.velocityY;
    player.velocityX *= friction;

    if (player.grounded) {
        player.velocityY = 0;
        player.jumping = false;
    }

    // Ensure the player stays within the canvas borders
    if (player.x < 0) {
        player.x = 0;
        player.velocityX = 0;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
        player.velocityX = 0;
    }
    if (player.y < 0) {
        player.y = 0;
        player.velocityY = 0;
    }
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.jumping = false;
        player.grounded = true;
    }

    player.grounded = false;
    for (let i = 0; i < platforms.length; i++) {
        let platform = platforms[i];
        let direction = checkCollision(player, platform);

        if (direction === "left" || direction === "right") {
            player.velocityX = 0;
        } else if (direction === "bottom") {
            player.grounded = true;
            player.jumping = false;
        } else if (direction === "top") {
            player.velocityY *= -1;
        }

        // Move the platforms side to side
        platform.x += platform.velocityX;
        if (platform.x <= 0 || platform.x + platform.width >= canvas.width) {
            platform.velocityX *= -1;
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the green border
    ctx.strokeStyle = "#0f0";
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw the player
    ctx.fillStyle = "#00f";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw the target
    ctx.strokeStyle = "#f00";
    ctx.lineWidth = 5;
    ctx.strokeRect(target.x, target.y, target.width, target.height);

    // Draw the platforms
    ctx.fillStyle = "#0f0";
    for (let i = 0; i < platforms.length; i++) {
        let platform = platforms[i];
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }

    // Check if the player reaches the target
    if (!messageDisplayed && player.x < target.x + target.width &&
        player.x + player.width > target.x &&
        player.y < target.y + target.height &&
        player.y + player.height > target.y) {
        displayMessage("Your keyword is 'Adventure'");
        messageDisplayed = true;
    }

    requestAnimationFrame(update);
}

function checkCollision(player, platform) {
    let vectorX = (player.x + (player.width / 2)) - (platform.x + (platform.width / 2));
    let vectorY = (player.y + (player.height / 2)) - (platform.y + (platform.height / 2));

    let halfWidths = (player.width / 2) + (platform.width / 2);
    let halfHeights = (player.height / 2) + (platform.height / 2);

    let collisionDirection = null;

    if (Math.abs(vectorX) < halfWidths && Math.abs(vectorY) < halfHeights) {
        let offsetX = halfWidths - Math.abs(vectorX);
        let offsetY = halfHeights - Math.abs(vectorY);

        if (offsetX < offsetY) {
            if (vectorX > 0) {
                collisionDirection = "left";
                player.x += offsetX;
            } else {
                collisionDirection = "right";
                player.x -= offsetX;
            }
        } else {
            if (vectorY > 0) {
                collisionDirection = "top";
                player.y += offsetY;
            } else {
                collisionDirection = "bottom";
                player.y -= offsetY;
            }
        }
    }

    return collisionDirection;
}

function displayMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.style.position = "absolute";
    messageDiv.style.top = "50%";
    messageDiv.style.left = "50%";
    messageDiv.style.transform = "translate(-50%, -50%)";
    messageDiv.style.padding = "20px";
    messageDiv.style.backgroundColor = "#000";
    messageDiv.style.color = "#fff";
    messageDiv.style.fontSize = "24px";
    messageDiv.style.border = "2px solid #fff";
    messageDiv.style.borderRadius = "10px";
    messageDiv.textContent = message;
    document.getElementById("gameContainer").appendChild(messageDiv);
}

update();
