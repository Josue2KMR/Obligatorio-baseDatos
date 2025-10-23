DROP DATABASE IF EXISTS obligatorio;
CREATE DATABASE obligatorio;
USE obligatorio;

CREATE TABLE participante (
    ci int PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE facultad(
    id_facultad INT NOT NULL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE programa_academico(
    nombre_programa VARCHAR(100) NOT NULL PRIMARY KEY,
    id_facultad INT NOT NULL,
    tipo VARCHAR(100) NOT NULL
);

CREATE TABLE edificio(
    nombre_edificio VARCHAR(100) NOT NULL PRIMARY KEY,
    direccion VARCHAR(100) NOT NULL,
    departamento VARCHAR(100) NOT NULL
);

CREATE TABLE turno(
    id_turno INT NOT NULL PRIMARY KEY,
    hora_inicio DATETIME NOT NULL,
    hora_fin DATETIME NOT NULL
);

CREATE TABLE login (
    correo VARCHAR(100) NOT NULL PRIMARY KEY,
    contraseña VARCHAR(100) NOT NULL,
    FOREIGN KEY (correo) REFERENCES participante(email)
);


CREATE TABLE participante_programa_academico(
    id_alumno_programa INT NOT NULL PRIMARY KEY,
    ci_participante INT NOT NULL,
    nombre_programa VARCHAR(100) NOT NULL,
    rol VARCHAR(100) NOT NULL,
    FOREIGN KEY (ci_participante) REFERENCES participante(ci),
    FOREIGN KEY (nombre_programa) REFERENCES programa_academico(nombre_programa)
);



CREATE TABLE sala(
    nombre_sala VARCHAR(100) NOT NULL PRIMARY KEY,
    edificio VARCHAR(100) NOT NULL,
    capacidad INT NOT NULL,
    tipo_sala VARCHAR(100) NOT NULL,
    FOREIGN KEY (edificio) REFERENCES edificio(nombre_edificio)
);


CREATE TABLE reserva(
    id_reserva INT NOT NULL PRIMARY KEY,
    nombre_sala VARCHAR(100) NOT NULL,
    edificio VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    id_turno INT NOT NULL,
    estado VARCHAR(100) NOT NULL,
    FOREIGN KEY (nombre_sala) REFERENCES sala(nombre_sala),
    FOREIGN KEY (edificio) REFERENCES edificio(nombre_edificio),
    FOREIGN KEY (id_turno) REFERENCES turno(id_turno)
);

CREATE TABLE reserva_participante(
    ci_participante INT NOT NULL,
    id_reserva INT NOT NULL,
    fecha_solicitud_reserva INT NOT NULL,
    asistencia BOOL NOT NULL,
    PRIMARY KEY (ci_participante, id_reserva),
    FOREIGN KEY (ci_participante) REFERENCES participante(ci),
    FOREIGN KEY (id_reserva) REFERENCES reserva(id_reserva)
);

CREATE TABLE sancion_participante (
    ci_participante INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    FOREIGN KEY (ci_participante) REFERENCES participante(ci)
);

