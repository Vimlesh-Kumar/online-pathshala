/* Replace with your SQL commands */

-- !!!!!!!   CREATE DATABSE online_pathshala IF NOT EXISTS

create table IF NOT EXISTS users (
    id int primary key AUTO_INCREMENT,
    created_at datetime not null,
    full_name varchar(100),
    email varchar(100) not null unique,
    password varchar(500) not null,
    user_role enum('student', 'teacher','admin') not null

);

create table IF NOT EXISTS courses(
    id int primary key AUTO_INCREMENT,
    title varchar(255),
    sub_title varchar(255),
    author varchar(100),
    categeory varchar(50),
    price decimal(6,2),
    rating decimal(4,2),
    url varchar(255)
);



create table IF NOT EXISTS cart(
    id int  primary key AUTO_INCREMENT,
    course_id int not null,
    user_id int not null,
    FOREIGN KEY(course_id) REFERENCES courses(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

create table IF NOT EXISTS wishlist(
    id int  primary key AUTO_INCREMENT,
    course_id int not null,
    user_id int not null,
    FOREIGN KEY(course_id) REFERENCES courses(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

create table IF NOT EXISTS reviews(
    id int  primary key AUTO_INCREMENT,
    content varchar(100),
    rating int not null,
    created_at datetime,
    updated_at datetime,
    course_id int not null,
    user_id int not null,
    FOREIGN KEY(course_id) REFERENCES courses(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

create table IF NOT EXISTS order_details(
    id int  primary key AUTO_INCREMENT,
    tranaction_id varchar(50) unique,
    created_at datetime,
    payment_method varchar(50) not null,
    total_paid decimal(6,2) not null,
    course_id int not null,
    user_id int not null,
    FOREIGN KEY(course_id) REFERENCES courses(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

create table IF NOT EXISTS enrollment(
    id int  primary key AUTO_INCREMENT,
    created_at datetime,
    is_completed boolean,
    course_id int not null,
    user_id int not null,
    FOREIGN KEY(course_id) REFERENCES courses(id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    progress decimal(6,2)
);

create table IF NOT EXISTS lesson(
    id int primary key AUTO_INCREMENT,
    duration varchar(50),
    course_id int not null,
    FOREIGN KEY(course_id) REFERENCES courses(id),
    lesson_name varchar(200),
    video_key varchar(200)
);

create table IF NOT EXISTS enroll_progress(
    id int primary key AUTO_INCREMENT,
    enrollment_id int not null,
    lesson_id int not null,
    FOREIGN KEY (enrollment_id) REFERENCES enrollment(id),
    FOREIGN KEY (lesson_id) REFERENCES lesson(id)
);



create table IF NOT EXISTS course_objectives(
    id int primary key AUTO_INCREMENT,
    objective varchar(255),
    course_id int not null,
    FOREIGN KEY(course_id) REFERENCES courses(id)
);