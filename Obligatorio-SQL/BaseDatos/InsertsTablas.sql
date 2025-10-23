
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
(50123498, 'Sofía', 'Torres', 'sofia.torres@correo.ucu.uy');