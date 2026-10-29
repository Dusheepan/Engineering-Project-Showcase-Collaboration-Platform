/**
 * Database Seed Script
 * Inserts 2 users and 8 sample engineering projects into MongoDB
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import Mongoose Models
const User = require('./models/User');
const Project = require('./models/Project');
const Comment = require('./models/Comment');
const CollaborationRequest = require('./models/CollaborationRequest');

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://127.0.0.1:27017/engineering_showcase';

const seedDatabase = async () => {
  try {
    console.log(' Connecting to MongoDB for database seeding...');
    await mongoose.connect(MONGO_URI);
    console.log(' Connected to MongoDB successfully.');

    // 1. Clear existing database collections
    console.log(' Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Comment.deleteMany({}),
      CollaborationRequest.deleteMany({}),
    ]);
    console.log(' Collections cleared.');

    // 2. Hash default passwords for test users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123!', salt);

    // 3. Create 2 Users (1 Student, 1 Admin)
    console.log(' Creating 2 users (1 student, 1 admin)...');
    const users = await User.create([
      {
        name: 'Alex Rivera',
        email: 'alex.rivera@eng.university.edu',
        password: hashedPassword,
        role: 'student',
        department: 'Computer Engineering',
      },
      {
        name: 'Dr. Sarah Chen',
        email: 'sarah.chen@eng.university.edu',
        password: hashedPassword,
        role: 'admin',
        department: 'Electrical & Electronic Engineering',
      },
    ]);

    const [studentUser, adminUser] = users;
    console.log(
      ` Created users:\n   - Student: ${studentUser.name} (${studentUser.email})\n   - Admin: ${adminUser.name} (${adminUser.email})`
    );

    // 4. Create 8 Sample Engineering Projects
    console.log(' Creating 8 sample engineering projects...');
    const sampleProjects = [
      {
        title: 'Autonomous Agricultural Drone with Edge Vision',
        description:
          'An autonomous quadcopter featuring lightweight multispectral imaging and real-time inference on an edge compute board to detect early crop stress, nitrogen deficiency, and weed clusters in precision agriculture.',
        techStack: ['Python', 'OpenCV', 'ROS2', 'PyTorch', 'C++'],
        category: 'AI/ML',
        githubUrl: 'https://github.com/alexrivera/agri-drone-vision',
        demoUrl: 'https://agri-drone.eng.example.edu',
        status: 'In Progress',
        lookingForCollaborators: true,
        owner: studentUser._id,
      },
      {
        title: 'Smart Campus Energy & Microgrid Monitor',
        description:
          'A distributed IoT sensor grid deployed across university laboratories to log high-resolution energy consumption, solar PV generation, and ambient room parameters with automated anomaly alerts.',
        techStack: ['ESP32', 'MQTT', 'Node.js', 'InfluxDB', 'Grafana'],
        category: 'IoT',
        githubUrl: 'https://github.com/sarahchen/smart-campus-energy',
        demoUrl: 'https://microgrid-monitor.eng.example.edu',
        status: 'Completed',
        lookingForCollaborators: false,
        owner: adminUser._id,
      },
      {
        title: 'Edge AI Structural Health Monitoring Sensor',
        description:
          'Ultra-low-power vibration analysis hardware unit placed on civil bridge girders to capture acoustic emissions and micro-fractures before visible cracking appears.',
        techStack: ['C', 'FreeRTOS', 'TensorFlow Lite', 'ARM Cortex-M4'],
        category: 'Embedded',
        githubUrl: 'https://github.com/alexrivera/edge-structural-monitor',
        demoUrl: '',
        status: 'In Progress',
        lookingForCollaborators: true,
        owner: studentUser._id,
      },
      {
        title: 'Engineering Project Collaboration Web Hub',
        description:
          'A responsive full-stack platform built for academic engineering institutions to archive capstone designs, showcase hardware prototypes, coordinate peer code reviews, and track deliverables.',
        techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Docker'],
        category: 'Web',
        githubUrl: 'https://github.com/sarahchen/engineering-showcase-hub',
        demoUrl: 'https://showcase.eng.example.edu',
        status: 'Completed',
        lookingForCollaborators: false,
        owner: adminUser._id,
      },
      {
        title: 'Motorized Rehabilitation Exoskeleton Arm',
        description:
          'A lightweight wearable robotic orthosis using surface electromyography (sEMG) biosensors and compliant actuators to assist stroke survivors in upper-extremity physical therapy exercises.',
        techStack: ['Arduino', 'C++', 'SolidWorks', 'MATLAB', 'Simulink'],
        category: 'Other',
        githubUrl: 'https://github.com/alexrivera/rehab-exoskeleton',
        demoUrl: '',
        status: 'Idea',
        lookingForCollaborators: true,
        owner: studentUser._id,
      },
      {
        title: 'Hazardous Chemical & Lab Safety Assistant',
        description:
          'A mobile app with barcode scanning, SDS (Safety Data Sheet) instant lookup, real-time chemical compatibility matrix validation, and spill incident reporting.',
        techStack: ['React Native', 'TypeScript', 'Firebase', 'Redux'],
        category: 'Mobile',
        githubUrl: 'https://github.com/sarahchen/lab-safety-assistant',
        demoUrl: 'https://safety-app.eng.example.edu',
        status: 'In Progress',
        lookingForCollaborators: true,
        owner: adminUser._id,
      },
      {
        title: 'Continuous 3-Lead ECG Telemetry Wearable',
        description:
          'A compact wearable medical telemetry device providing continuous 3-lead ECG streaming via BLE with firmware-level arrhythmia detection and battery life exceeding 72 hours.',
        techStack: ['Nordic nRF52', 'BLE', 'C', 'Digital Signal Processing'],
        category: 'Embedded',
        githubUrl: 'https://github.com/alexrivera/ecg-telemetry-firmware',
        demoUrl: '',
        status: 'Completed',
        lookingForCollaborators: false,
        owner: studentUser._id,
      },
      {
        title: 'Autonomous Submersible for Marine Turbidity Profiling',
        description:
          'An untethered underwater vehicle (AUV) capable of diving to 50 meters, performing scheduled water quality profiling, depth mapping, and logging spatial water samples.',
        techStack: ['Raspberry Pi', 'Python', 'ROS2', 'OpenCV', 'Hydrodynamics'],
        category: 'Other',
        githubUrl: 'https://github.com/alexrivera/marine-auv-profiler',
        demoUrl: '',
        status: 'Idea',
        lookingForCollaborators: true,
        owner: studentUser._id,
      },
    ];

    const createdProjects = await Project.insertMany(sampleProjects);
    console.log(` Created ${createdProjects.length} sample engineering projects.`);

    // 5. Create sample Comments & Collaboration Requests to showcase relationships
    console.log(' Adding sample peer comments & collaboration requests...');
    await Comment.create([
      {
        project: createdProjects[0]._id,
        author: adminUser._id,
        text: 'Outstanding work on the edge vision pipeline! Please verify sensor calibration for high sunlight exposure conditions.',
      },
      {
        project: createdProjects[1]._id,
        author: studentUser._id,
        text: 'The MQTT packet throughput is very stable across all building nodes.',
      },
    ]);

    await CollaborationRequest.create([
      {
        project: createdProjects[0]._id,
        requester: studentUser._id,
        message: 'Interested in contributing ROS2 navigation and waypoint tracking modules!',
        status: 'pending',
      },
      {
        project: createdProjects[4]._id,
        requester: studentUser._id,
        message: 'I have 3D printing and CAD experience to assist with mechanical housing redesign.',
        status: 'accepted',
      },
    ]);

    console.log(' Sample comments and collaboration requests inserted.');
    console.log('===========================================================');
    console.log('🎉 Database seeding completed successfully!');
    console.log(`   - Users inserted: ${users.length}`);
    console.log(`   - Projects inserted: ${createdProjects.length}`);
    console.log('===========================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedDatabase();
