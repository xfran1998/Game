const canvas = document.querySelector('#game');
const context = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

class Pawn{
    constructor(size, pos, color, speed){
        this.size = size;
        this.pos = pos;
        this.color = color;
        this.speed = speed;
    }

    Draw(){
        context.beginPath();
        context.arc(this.pos[0], this.pos[1], this.size, 0, Math.PI*2, false);  
        context.fillStyle = this.color;           
        context.fill(); 
    }

    Update(tarjetPos){
        this.pos = [this.pos[0]+tarjetPos[0], this.pos[1]+tarjetPos[1]];
        console.log(this.pos);
    }    
}

class Projectile extends Pawn{
    constructor(size, pos, color, speed, targetPos){
        super(size, pos, color, speed);

        // Getting vector towards player normalized
        let vec = [targetPos[0] - pos[0], targetPos[1] - pos[1]];
        let mod = Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1]);
        this.speed = [vec[0]*speed/mod, vec[1]*speed/mod] // Applying speed also
    }

    Update(){
        super.Update(this.speed);
    }
}

class Player extends Pawn{
    constructor(size, pos, color, speed, name){
        super(size, pos, color, speed);
        this.name = name;
    }
}

class GameState{
    constructor(){
        this.players = new Array();
        this.projectiles = new Array();
    }

    AddPlayer(player){
        this.players.push(player);
    }

    AddProjectiles(proj){
        this.projectiles.push(proj);
    }
}

class Game{
    constructor(){
        this.myGameState = new GameState();
    }

    Run(){
        requestAnimationFrame(() => this.Run());
        this.myGameState.projectiles.forEach(proj => {
            proj.Update();
        });
        this.Redraw();
    }

    Redraw(){
        this.myGameState.projectiles.forEach(proj => {
            proj.Draw();
        });
        
        this.myGameState.players.forEach(player => {
            player.Draw();
        });
    }

    spawnPlayer(size, pos, color, speed, name){
        // const x = innerWidth / 2;
        // const y = innerHeight / 2;
        // const size = 50;
        // const pos = [x, y];
        // const color = 'blue';
        // const speed = 1;
        // const name = "Player01";
    
        const newPlayer = new Player(size, pos, color, speed, name);
        this.myGameState.AddPlayer(newPlayer);
        newPlayer.Draw();
    }
    
    spawnProjectile(size, pos, color, speed, posTarjet){
        // const x = innerWidth / 2;
        // const y = innerHeight / 2;
        // const size = 30;
        // const pos = [innerWidth-size, innerHeight-size];
        // const color = 'red';
        // const speed = 1;
        // const tarjetPos = [x,y];
        // +size/2
        const newProj = new Projectile(size, pos, color, speed, posTarjet);
        this.myGameState.AddProjectiles(newProj);
        newProj.Draw();
    }
}

// defaultPlayer();
// defaultProjectile();
let myGame = new Game();
myGame.spawnPlayer(50, [innerWidth/2,innerHeight/2], 'blue', 0, '')
myGame.Run();

addEventListener('click', (e) => {
    // console.log([e.x,e.y]);
    myGame.spawnProjectile(20, [e.x,e.y], 'red', 5, [innerWidth/2,innerHeight/2]);
});