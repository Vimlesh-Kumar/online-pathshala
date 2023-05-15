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
    video_key varchar(200),
    section_name varchar(200)
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

INSERT INTO users(full_name,email,password,user_role) VALUES('Test Admin','admin@test.com','$2b$10$0Wj/MmXpVOWEDiqA7WgY2.rWCUADDrKLZmJ4aGWtZvCMbTLbOSE.C','Admin'),('Test Student','student@test.com','$2b$10$Y43eTtQyTcCzilM3QO.s8eqqJKLS5c1VoWxuPGYg7PWgKej.mQMrK','Student'),('Test Tutor','tutor@test.com','$2b$10$ZaTklmXHQHZKfv9fO7j6FOtVVu9TjTbzRPqd646yUYK3DPhz40xne','Tutor');

INSERT INTO `courses` (`id`, `author`, `category`, `price`, `rating`, `subtitle`, `thumb_url`, `title`)
    VALUES (10010, 'Vimlesh Kumar', 'Development', '1117.99', '4.50',
        'Learn Python like a Professional. Start from the basics and go all the way to creating your own applications and games.',
        'https://i3.ytimg.com/vi/XKHEtdqhLK8/maxresdefault.jpg', 'Complete Python Bootcamp'),
       (10011, 'Dani Krossing', 'Development', '2118.99', '4.50',
        'Master fundamentals with JavaScript exercises, projects, live examples & more',
        'https://i3.ytimg.com/vi/jS4aFq5-91M/maxresdefault.jpg', 'Learn JavaScript Programming'),
       (10012, 'Caleb Curry', 'Development', '4119.99', '3.50', 'Obtain valuable Core Java Skills And Java Certification',
        'https://i3.ytimg.com/vi/GoXwIVyNvX0/maxresdefault.jpg', 'Java Programming Essentials'),
       (10013, 'Gareth David Studio', 'PhotoVideo', '4111.99', '4.50',
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
       (10019, 'TTFS', 'Office', '4766.99', '3.50',
        'Microsoft Excel Beginner to Professional. Includes Pivot Tables, Power Query, NEW Formulas',
        'https://i3.ytimg.com/vi/Vl0H-qTclOg/maxresdefault.jpg', 'Master Microsoft Excel'
);

INSERT INTO `course_objectives` (`id`, `objective`, `course_id`)
VALUES (1, 'Be able to program in Python professionally', 10010),
       (2, 'Build GUIs and Desktop applications with Python', 10010),
       (3, 'Be able to build fully fledged websites and web apps with Python', 10010),
       (4, 'Create a portfolio of Python projects to apply for developer jobs', 10010),
       (5, 'Be able to build fully fledged websites and web apps with Python', 10010),
       (6, 'All about variables, functions, objects and arrays', 10011),
       (7, 'Modern ES6 from the beginning: arrow functions, destructuring, spread operator, optional chaining', 10011),
       (8, 'Project-driven learning with plenty of examples', 10011),
       (9, 'Asynchronous JavaScript: Event loop, promises, async/await, AJAX calls and APIs', 10011),
       (10, 'Complex concepts like the \'this\' keyword, higher-order functions, closures', 10011),
       (11, 'Learn industry best practices in Java software development from a professional', 10012),
       (12, 'Obtain proficiency in Java 8 and Java 11', 10012),
       (13, 'Be able to demonstrate your understanding of Java to future employers', 10012),
       (14, 'Acquire essential java basics for transitioning to the Spring Framework, Java EE, Android', 10012),
       (15, 'Master Exceptions, IO, Collections Framework, Generics, Multi-threading, Databases', 10012),
       (16, 'Master advanced Illustrator tools and techniques', 10013),
       (17, 'Design your own graphics, without any experience', 10013),
       (18, 'Create custom typography', 10013),
       (19, 'Take hand drawings and recreate them using Illustrator', 10013),
       (20, 'Export your projects for print, web, or other design projects', 10013),
       (21, 'Edit an entire video from beginning to end, using professional and efficient techniques', 10014),
       (22, 'Master Premiere Pro and be CONFIDENT Editing Your Own Videos', 10014),
       (23, 'Learn how to edit social media clips for Instagram, Facebook, Twitter & YouTube Stories', 10014),
       (24, 'How to organize your video editing footage like a Pro', 10014),
       (25, 'Add a feeling to your video with color grading', 10014),
       (26, 'Acquire a solid understanding of key economic relationships', 10015),
       (27, 'Understand business cycles', 10015),
       (28, 'Using demand and supply, illustrate price determination', 10015),
       (29, 'Examine the impact of tax/subsidies', 10015),
       (30, 'Decluttering and impact on economy', 10015),
       (31, 'Understand the fundamentals of weight loss', 10016),
       (32, 'Develop healthy eating habits', 10016),
       (33, 'Stay motivated for long term results', 10016),
       (34, 'Lose weight Naturally within 2 weeks', 10016),
       (35, 'Have a healthy relationship with food', 10016),
       (36, 'Confidently analyze multifamily real estate investment opportunities', 10017),
       (37, 'Use Professional Grade Investment Models to Evaluate Your Deals', 10017),
       (38, 'Use Smart Investment Deal Structures With Business Partners', 10017),
       (39, 'Evaluate Rental Income Properties', 10017),
       (40, 'Know a \"Good\" Investment from a \"Bad\" Investment', 10017),
       (41, 'You will learn to read sheet music AS you learn to play-by-ear', 10018),
       (42, 'You get to sound like a pro right from the start', 10018),
       (43, 'Learn to play the piano without theory', 10018),
       (44, 'Master unique tips & techniques that you wont find in ANY other course, guaranteed', 10019),
       (45, 'Build a solid understanding on the Basics of Microsoft Excel', 10019),
       (46, 'Maintain large sets of Excel data in a list or table', 10019),
       (47, 'Write advanced conditional, text, date and lookup functions, including XLOOKUP', 10019),
       (48, 'Get LIFETIME access to project files, quizzes, homework exercises', 10019),
       (49, 'Navigating the keyboard', 10018),
       (50, 'Basic improvisation', 10018);


