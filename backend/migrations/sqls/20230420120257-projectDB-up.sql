/* Replace with your SQL commands */
-- !!!!!!!   CREATE DATABSE online_pathshala IF NOT EXISTS

create table IF NOT EXISTS users (
    id int primary key AUTO_INCREMENT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    full_name varchar(100),
    email varchar(100) not null unique,
    password varchar(500) not null,
    user_role enum('Student', 'Tutor', 'Admin') not null
);

create table IF NOT EXISTS courses(
    id int primary key AUTO_INCREMENT,
    author varchar(100),
    category varchar(50),
    price decimal(6, 2),
    rating decimal(4, 2),
    subtitle varchar(500),
    thumb_url varchar(255),
    title varchar(255)
);

create table IF NOT EXISTS cart(
    id int primary key AUTO_INCREMENT,
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
    id int primary key AUTO_INCREMENT,
    content varchar(100),
    rating int not null,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    course_id int not null,
    user_id int not null,
    FOREIGN KEY(course_id) REFERENCES courses(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

create table IF NOT EXISTS order_details(
    id int primary key AUTO_INCREMENT,
    tranaction_id varchar(50) unique,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method varchar(50) not null,
    total_paid decimal(6, 2) not null,
    course_id int not null,
    user_id int not null,
    FOREIGN KEY(course_id) REFERENCES courses(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

create table IF NOT EXISTS enrollment(
    id int primary key AUTO_INCREMENT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_completed boolean,
    course_id int not null,
    user_id int not null,
    FOREIGN KEY(course_id) REFERENCES courses(id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    progress decimal(6, 2)
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

INSERT INTO users(full_name,email,password,user_role) VALUES('Test Admin','admin@test.com','Admin@123','Admin'),('Test Student','student@test.com','Student@123','Student'),('Test Tutor','tutor@test.com','Tutor@123','Tutor');

INSERT INTO `courses` (`id`, `author`, `category`, `price`, `rating`, `subtitle`, `thumb_url`, `title`)
    VALUES (10010, 'Corey Schafer', 'Development', '17.99', '4.50',
        'Learn Python like a Professional. Start from the basics and go all the way to creating your own applications and games.',
        'https://i3.ytimg.com/vi/XKHEtdqhLK8/maxresdefault.jpg', 'Complete Python Bootcamp'),
       (10011, 'Dani Krossing', 'Development', '18.99', '4.50',
        'Master fundamentals with JavaScript exercises, projects, live examples & more',
        'https://i3.ytimg.com/vi/jS4aFq5-91M/maxresdefault.jpg', 'Learn JavaScript Programming'),
       (10012, 'Caleb Curry', 'Development', '1119.99', '3.50', 'Obtain valuable Core Java Skills And Java Certification',
        'https://i3.ytimg.com/vi/GoXwIVyNvX0/maxresdefault.jpg', 'Java Programming Essentials'),
       (10013, 'Gareth David Studio', 'PhotoVideo', '2111.99', '4.50',
        'Learn graphic design, logo design, and more with this in-depth, practical, easy-to-follow course!',
        'https://i3.ytimg.com/vi/9EGI-FSr0Ig/maxresdefault.jpg', 'Beginners Guide To Adobe Illustrator'),
       (10014, 'chinfat', 'PhotoVideo', '2112.50', '3.50',
        'Learn Beginner-Advanced Video Editing, Audio Editing, Color Grading, Motion Graphics, and more',
        'https://i3.ytimg.com/vi/u99i1SmDgIc/maxresdefault.jpg', 'Learn Adobe Premiere Pro CC'),
       (10015, 'Jacob Clifford', 'Finance', '1115.99', '4.50',
        'The Easiest Beginner level Course on Economics with real life examples and graphic content. Perfect for Newbies!',
        'https://i3.ytimg.com/vi/g9aDizJpd_s/maxresdefault.jpg', 'Crash Course Economics'),
       (10016, 'MrandMrsMuscle', 'Health', '1448.99', '3.50',
        'This course will help jump-start your body to lose belly fat, lose weight and guide you with a 14 day exercise plan. NO EQUIPMENT needed',
        'https://i3.ytimg.com/vi/By6GXzcldGY/maxresdefault.jpg', 'Lose Belly Fat in 14 Days'),
       (10017, 'Robert Kiyosaki', 'Real Estate', '2441.99', '4.50',
        'Learn professional investment techniques for real estate investing in residential and commercial properties',
        'https://i3.ytimg.com/vi/UJv9-F7SN5A/maxresdefault.jpg', 'Real Estate Investing'),
       (10018, 'Bill Hilton', 'Music', '1445.99', '4.50',
        'Learn Piano in WEEKS not years. Play-By-Ear & learn to Read Music. Pop, Blues, Jazz, Ballads, Classical',
        'https://i3.ytimg.com/vi/WJ3-F02-F_Y/maxresdefault.jpg', 'How To Play Piano for Beginners'),
       (10019, 'TTFS', 'Office', '1766.99', '3.50',
        'Microsoft Excel Beginner to Professional. Includes Pivot Tables, Power Query, NEW Formulas',
        'https://i3.ytimg.com/vi/Vl0H-qTclOg/maxresdefault.jpg', 'Master Microsoft Excel'
);

