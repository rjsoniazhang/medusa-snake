// "system" configuration
let canvas;
let context;
let fpsInterval = 1000 / 12;
let size = 10;
let now;
let then = Date.now();
let request_id;

// variables
let food;
let move;
let score = 0;


// Linked list to store the coordinates where snake head turns.
class Node  // constructor: using x, y only
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
        this.prev = null;
        this.next = null;
    }
}
class LinkedList  // preview(), append(node), first(), last()
{
    constructor() { this.head = null; this.tail = null; }

    *[Symbol.iterator]() {  // for xx of xxxx
        let ptr = this.head;
        while (ptr !== null) 
        {
            yield ptr;
            ptr = ptr.next;
        }
    }

    preview()  // for debugging
    {
        let ptr = this.head;
        let count = 0;
        while (ptr) { console.log("Pointer: ", ptr.x, ptr.y); ptr = ptr.next; count++; }
        console.log("snake length:", count);
        console.log("end of preview");
    }

    append(node)  // append a node
    {
        if (!this.head) { this.head = node; this.tail = node; return; }  // if empty linked list, then this is the 1st
        // else
        let ptr = this.head;
        while (ptr.next) { ptr = ptr.next; }  // go to the last pointer
        node.prev = ptr;
        ptr.next = node;
        this.tail = node;
    }

    first() { return this.head; }  // return first node

    last() { return this.tail; }  // return last node
}

let head = new Node(150, 150);
let snake = new LinkedList();
snake.append(head);

document.addEventListener("DOMContentLoaded", init, false);

function init()
{
    canvas = document.querySelector("canvas");
    context = canvas.getContext("2d");
    
    window.addEventListener("keydown", activate, false);

    draw();
}

function draw()
{
    request_id = window.requestAnimationFrame(draw);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) { return; }
    then = now - (elapsed % fpsInterval);

    if (!food)  // generate the food
    {
        let foodX, foodY;
        let collided = false;
        do 
        {
            foodX = randint(0, canvas.width - size);
            foodY = randint(0, canvas.height - size);
            collided = false;
            for (let part of snake) 
            {
                if (part.x === foodX && part.y === foodY) 
                {
                    collided = true;
                    break;
                }
            }
        } while (collided);  // ensure the food is not generated in snake body
        food = 
        {
            x: foodX,
            y: foodY
        };
    }

    // draw
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "green";
    context.fillRect(food.x, food.y, size, size);
    context.fillStyle = "yellow";
    let ptr = head;
    while (ptr)
    {
        context.fillRect(ptr.x, ptr.y, size, size);
        ptr = ptr.next;
    }

    // if collides
    if (snake_collides()) { stop(); return; }

    // if eats food
    if (
        ((head.x <= food.x && head.x + size >= food.x) ||
        (head.x <= food.x + size && head.x + size >= food.x + size))
        && 
        ((head.y <= food.y && head.y + size >= food.y) ||
        (head.y <= food.y + size && head.y + size >= food.y + size))
        )
    {
        food = null;  // food disappear
        score += 1;  // score += 1

        // snake length += 1; grows the tail i/o head
        let part = new Node(snake.last().x, snake.last().y);
        // part location
        switch(move)
        {
            case "L": part.x += size; break;
            case "R": part.x -= size; break;
            case "U": part.y += size; break;
            case "D": part.y -= size; break;
            default: ;
        }
        snake.append(part);
    }

    // movement
    // parts moving
    ptr = snake.last();
    while (ptr.prev)
    {
        ptr.x = ptr.prev.x;
        ptr.y = ptr.prev.y;
        ptr = ptr.prev;
    }
    // head moving
    switch(move)
    {
        case "L": head.x -= size; break;
        case "R": head.x += size; break;
        case "U": head.y -= size; break;
        case "D": head.y += size; break;
        default: ;
    }
}

function randint(min, max) { return Math.round(Math.random() * (max - min)) + min; }

// associate key press to variables
function activate(event)
{
    let key = event.key;
    if (key === "ArrowLeft" && move !== "R") { move = "L"; }
    else if (key === "ArrowRight" && move !== "L") { move = "R"; }
    else if (key === "ArrowUp" && move !== "D") { move = "U"; }
    else if (key === "ArrowDown" && move !== "U") { move = "D"; }
}

// to tell if collides
function snake_collides()  // if collides
{
    // if collides on wall; only the head
    if ((head.x < 0) ||
        (head.x + size > canvas.width) ||
        (head.y < 0) ||
        (head.y + size > canvas.height)) { return true; }

    // if collides in self: for each part, if head...
    let ptr = snake.head.next;
    while (ptr)
    {
        if (head.x === ptr.x && head.y === ptr.y) { return true; }
        ptr = ptr.next;
    }
    return false;
}

// if dies
function stop()
{
    window.removeEventListener("keydown", activate, false);
    window.cancelAnimationFrame(request_id);
    let outcome_element = document.querySelector("#outcome");
    let output = score + " points. Congrats (?)";
    outcome_element.innerHTML = output;
}