/* Banco de exemplo usado na trilha de Banco de Dados: um jogo online (Arena Online).
   Cada execução de exercício começa com este banco do zero. */
window.SQL_SEEDS = window.SQL_SEEDS || {};

window.SQL_SEEDS.arena = `
CREATE TABLE guildas (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  regiao TEXT NOT NULL
);

CREATE TABLE jogadores (
  id INTEGER PRIMARY KEY,
  nick TEXT NOT NULL UNIQUE,
  classe TEXT NOT NULL,
  nivel INTEGER NOT NULL DEFAULT 1 CHECK (nivel BETWEEN 1 AND 100),
  pontos INTEGER NOT NULL DEFAULT 0,
  guilda_id INTEGER REFERENCES guildas(id)
);

CREATE TABLE partidas (
  id INTEGER PRIMARY KEY,
  jogador_id INTEGER NOT NULL REFERENCES jogadores(id),
  modo TEXT NOT NULL,
  abates INTEGER NOT NULL,
  mortes INTEGER NOT NULL,
  resultado TEXT NOT NULL CHECK (resultado IN ('V', 'D')),
  duracao_min INTEGER NOT NULL
);

CREATE TABLE itens (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  raridade TEXT NOT NULL,
  preco REAL NOT NULL CHECK (preco >= 0)
);

INSERT INTO guildas VALUES
  (1, 'Lobos de Prata', 'Nordeste'),
  (2, 'Pixel Rebels', 'Sudeste'),
  (3, 'Code Ninjas', 'Sul'),
  (4, 'Night Owls', 'Norte');

INSERT INTO jogadores VALUES
  (1, 'Kira', 'Mago', 42, 1850, 1),
  (2, 'Shadow', 'Assassino', 55, 2310, 2),
  (3, 'Leo', 'Guerreiro', 18, 640, 1),
  (4, 'Mia', 'Arqueiro', 33, 1420, 3),
  (5, 'Neo', 'Mago', 61, 2780, 2),
  (6, 'Rui', 'Suporte', 27, 980, 4),
  (7, 'Bia', 'Guerreiro', 48, 2050, 3),
  (8, 'Kai', 'Arqueiro', 12, 310, NULL),
  (9, 'Luna', 'Suporte', 39, 1600, 1),
  (10, 'Zed', 'Assassino', 22, 870, 4),
  (11, 'Ana', 'Mago', 8, 150, NULL),
  (12, 'Tico', 'Guerreiro', 51, 2200, 2);

INSERT INTO partidas VALUES
  (1, 1, 'Ranqueada', 8, 3, 'V', 24),
  (2, 1, 'Casual', 5, 6, 'D', 18),
  (3, 2, 'Ranqueada', 14, 2, 'V', 31),
  (4, 2, 'Torneio', 9, 4, 'V', 42),
  (5, 3, 'Casual', 2, 7, 'D', 15),
  (6, 4, 'Ranqueada', 6, 5, 'V', 27),
  (7, 5, 'Torneio', 12, 3, 'V', 38),
  (8, 5, 'Ranqueada', 7, 7, 'D', 29),
  (9, 6, 'Casual', 1, 2, 'V', 20),
  (10, 7, 'Ranqueada', 10, 4, 'V', 33),
  (11, 7, 'Casual', 4, 8, 'D', 17),
  (12, 8, 'Casual', 0, 5, 'D', 12),
  (13, 9, 'Ranqueada', 3, 1, 'V', 26),
  (14, 10, 'Ranqueada', 6, 9, 'D', 22),
  (15, 12, 'Torneio', 11, 6, 'V', 40),
  (16, 12, 'Ranqueada', 8, 8, 'D', 35),
  (17, 4, 'Casual', 7, 2, 'V', 19),
  (18, 1, 'Torneio', 6, 4, 'D', 36);

INSERT INTO itens VALUES
  (1, 'Espada Longa', 'Arma', 'Comum', 120),
  (2, 'Arco Elfico', 'Arma', 'Raro', 450),
  (3, 'Cajado Arcano', 'Arma', 'Epico', 980),
  (4, 'Pocao de Vida', 'Consumivel', 'Comum', 25),
  (5, 'Pocao de Mana', 'Consumivel', 'Comum', 30),
  (6, 'Escudo de Ferro', 'Armadura', 'Comum', 200),
  (7, 'Elmo do Dragao', 'Armadura', 'Lendario', 2500),
  (8, 'Botas Velozes', 'Armadura', 'Raro', 380),
  (9, 'Adaga Sombria', 'Arma', 'Epico', 1100),
  (10, 'Elixir Supremo', 'Consumivel', 'Lendario', 1500);
`;

/* Linhas extras usadas só na correção, para conferir que a consulta funciona com outros dados */
window.SQL_SEEDS.arena_extra = `
INSERT INTO guildas VALUES (5, 'Byte Force', 'Centro-Oeste');
INSERT INTO jogadores VALUES
  (13, 'Vex', 'Arqueiro', 70, 3100, 5),
  (14, 'Pip', 'Suporte', 3, 40, NULL);
INSERT INTO partidas VALUES
  (19, 13, 'Ranqueada', 15, 1, 'V', 30),
  (20, 14, 'Casual', 0, 3, 'D', 10),
  (21, 13, 'Torneio', 9, 5, 'V', 44);
INSERT INTO itens VALUES
  (11, 'Anel de Fogo', 'Acessorio', 'Raro', 600),
  (12, 'Pocao de Escudo', 'Consumivel', 'Comum', 40);
`;
