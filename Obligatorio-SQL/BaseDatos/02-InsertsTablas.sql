SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE obligatorio;

-- INSERTAR TURNOS
INSERT INTO turno ( hora_inicio, hora_fin) VALUES
('08:00:00', '09:00:00'),
('09:00:00', '10:00:00'),
('10:00:00', '11:00:00'),
('11:00:00', '12:00:00'),
('12:00:00', '13:00:00'),
('13:00:00', '14:00:00'),
('14:00:00', '15:00:00'),
('15:00:00', '16:00:00'),
('16:00:00', '17:00:00'),
('17:00:00', '18:00:00'),
('18:00:00', '19:00:00'),
('19:00:00', '20:00:00'),
('20:00:00', '21:00:00'),
('21:00:00', '22:00:00'),
('22:00:00', '23:00:00');

-- INSERTAR FACULTADES
INSERT INTO facultad (nombre) VALUES
('CIENCIAS EMPRESARIALES'),
('DERECHO Y CIENCIAS HUMANAS'),
('INGENIERÍA Y TECNOLOGÍAS'),
('CIENCIAS DE LA SALUD');

-- INSERTAR EDIFICIOS --
INSERT INTO edificio (nombre_edificio, direccion, departamento) VALUES
('Madre Marta', 'Av. Garibaldi 2831', 'Montevideo'),
('Sacre Coeur', 'Av. 8 de Octubre', 'Montevideo'),
('Mullin', 'Comandante Braga 2715', 'Montevideo'),
('San José', 'Av. 8 de Octubre 2733', 'Montevideo');

-- INSERTAR PROGRAMAS ACADEMICOS
INSERT INTO programa_academico (nombre_programa, id_facultad, tipo) VALUES
('Ingeniería en Sistemas', 3, 'grado'),
('Ingeniería Industrial', 3, 'grado'),
('Contador Público', 1, 'grado'),
('Maestría en Administración', 1, 'posgrado'),
('Abogacía', 2, 'grado'),
('Maestría en Derecho', 2, 'posgrado');

-- INSERTAR SALAS
INSERT INTO sala(nombre_sala, edificio, capacidad, tipo_sala) VALUES
('Sala 101', 'Mullin', 6, 'libre'),
('Sala 102', 'Mullin', 8, 'libre'),
('Sala 201', 'Sacre Coeur', 4, 'libre'),
('Sala Posgrado A', 'Sacre Coeur', 10, 'posgrado'),
('Sala Posgrado B', 'San José', 8, 'posgrado'),
('Sala Docentes 1', 'San José', 6, 'docente'),
('Sala Docentes 2', 'Sacre Coeur', 4, 'docente'),
('Sala 301', 'Madre Marta', 12, 'libre');

-- INSERTAR PARTICIPANTES
INSERT INTO participante(ci, nombre, apellido, email) VALUES
(51122334, 'Avril', 'Fernández', 'avril.fernandez@correo.ucu.uy'),
(43215678, 'Josue', 'Pérez', 'josue.perez@correo.ucu.uy'),
(49876543, 'Mateo', 'Castro', 'mateo.castro@correo.ucu.uy'),
(52345671, 'Joaquin', 'Silva', 'joaquin.silva@correo.ucu.uy'),
(51478932, 'Guillermo', 'López', 'guillermo.lopez@correo.ucu.uy'),
(50987456, 'Lucía', 'Rodríguez', 'lucia.rodriguez@correo.ucu.uy'),
(47654321, 'Camila', 'Santos', 'camila.santos@correo.ucu.uy'),
(48976540, 'Martín', 'González', 'martin.gonzalez@correo.ucu.uy'),
(52789452, 'Valentina', 'Suárez', 'valentina.suarez@correo.ucu.uy'),
(50123498, 'Sofía', 'Torres', 'sofia.torres@correo.ucu.uy'),
(11111111, 'Admin', 'Sistema', 'admin@correo.ucu.uy');

INSERT INTO
    login (correo, contraseña)
VALUES
    ('avril.fernandez@correo.ucu.uy', 'pass123'),
    ('josue.perez@correo.ucu.uy', 'pass123'),
    ('mateo.castro@correo.ucu.uy', 'pass123'),
    ('joaquin.silva@correo.ucu.uy', 'pass123'),
    ('guillermo.lopez@correo.ucu.uy', 'pass123'),
    ('lucia.rodriguez@correo.ucu.uy', 'pass123'),
    ('camila.santos@correo.ucu.uy', 'pass123'),
    ('martin.gonzalez@correo.ucu.uy', 'pass123'),
    ('valentina.suarez@correo.ucu.uy', 'pass123'),
    ('sofia.torres@correo.ucu.uy', 'pass123'),
    ('admin@correo.ucu.uy', 'admin123');


-- Asignar roles a los participantes existentes
-- Participante 1: Estudiante de grado (Ingeniería en Sistemas)
INSERT INTO participante_programa_academico (ci_participante, nombre_programa, id_facultad, rol) VALUES
(51122334, 'Ingeniería en Sistemas', 3, 'estudiante');

-- Participante 2: Estudiante de grado (Ingeniería Industrial)
INSERT INTO participante_programa_academico (ci_participante, nombre_programa, id_facultad, rol) VALUES
(43215678, 'Ingeniería Industrial', 3, 'estudiante');

-- Participante 3: Estudiante de posgrado (Maestría en Administración)
INSERT INTO participante_programa_academico (ci_participante, nombre_programa, id_facultad, rol) VALUES
(49876543, 'Maestría en Administración', 1, 'estudiante');

-- Participante 4: Docente (Abogacía)
INSERT INTO participante_programa_academico (ci_participante, nombre_programa, id_facultad, rol) VALUES
(52345671, 'Abogacía', 2, 'docente');

-- Participante 5: Docente (Ingeniería en Sistemas)
INSERT INTO participante_programa_academico (ci_participante, nombre_programa, id_facultad, rol) VALUES
(51478932, 'Ingeniería en Sistemas', 3, 'docente');

-- Participante 6: Estudiante de grado (Contador Público)
INSERT INTO participante_programa_academico (ci_participante, nombre_programa, id_facultad, rol) VALUES
(50987456, 'Contador Público', 1, 'estudiante');

-- Participante 7: Estudiante de posgrado (Maestría en Derecho)
INSERT INTO participante_programa_academico (ci_participante, nombre_programa, id_facultad, rol) VALUES
(47654321, 'Maestría en Derecho', 2, 'estudiante');

-- Participante 8: Estudiante de grado (Abogacía)
INSERT INTO participante_programa_academico (ci_participante, nombre_programa, id_facultad, rol) VALUES
(48976540, 'Abogacía', 2, 'estudiante');

-- Participante 9: Estudiante de grado (Ingeniería Industrial)
INSERT INTO participante_programa_academico (ci_participante, nombre_programa, id_facultad, rol) VALUES
(52789452, 'Ingeniería Industrial', 3, 'estudiante');

-- Participante 10: Estudiante de grado (Contador Público)
INSERT INTO participante_programa_academico (ci_participante, nombre_programa, id_facultad, rol) VALUES
(50123498, 'Contador Público', 1, 'estudiante');

INSERT INTO participante_programa_academico (ci_participante, nombre_programa, id_facultad, rol)
VALUES (11111111, 'Ingeniería en Sistemas', 3, 'admin');

-- Verificar que los roles se insertaron correctamente
SELECT
    p.ci,
    p.nombre,
    p.apellido,
    ppa.rol,
    ppa.nombre_programa,
    pa.tipo
FROM participante p
JOIN participante_programa_academico ppa ON p.ci = ppa.ci_participante
JOIN programa_academico pa ON pa.nombre_programa = ppa.nombre_programa
ORDER BY p.ci;



INSERT INTO participante (ci, nombre, apellido, email)
VALUES (12345678, 'Juan', 'Martínez', 'j.m@correo.ucu.edu.uy');
INSERT INTO login (correo, contraseña)
VALUES ('j.m@correo.ucu.edu.uy', '1234');