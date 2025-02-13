// Updated file to add clear instructions for interactive objects during emergency steps
export class EventManager {
  constructor(game) {
    this.game = game;
    this.activeEvents = new Set();
    this.scheduledEvents = [];
    
    // Enhanced fire alarm procedure for childcare
    this.fireAlarmSteps = {
      ALERT_STAFF: {
        title: 'Alert Staff',
        description: 'Immediately inform all staff of the emergency.',
        points: 10,
        interaction: 'EMERGENCY_BUTTON',
        requiredTime: 10,
        nextStep: 'CALL_EMERGENCY'
      },
      CALL_EMERGENCY: {
        title: 'Place Emergency Call',
        description: 'Dial 112 and report:\n- Where did it happen?\n- What happened?\n- How many children/people are affected?\n- Wait for further instructions!',
        points: 15,
        interaction: 'EMERGENCY_PHONE',
        requiredTime: 30,
        nextStep: 'START_EVACUATION'
      },
      START_EVACUATION: {
        title: 'Initiate Evacuation',
        description: 'Begin the evacuation of the daycare groups (ages 1-2). Arrange older children in pairs simultaneously.',
        points: 25,
        interaction: 'GROUP_ASSEMBLY',
        requiredTime: 60,
        nextStep: 'CHECK_ROOMS'
      },
      CHECK_ROOMS: {
        title: 'Check Rooms',
        description: 'Inspect all rooms (including toilets and nap areas) for any children left behind.',
        points: 20,
        interaction: 'ROOM_CHECK',
        requiredTime: 45,
        nextStep: 'REACH_ASSEMBLY'
      },
      REACH_ASSEMBLY: {
        title: 'Proceed to Assembly Point',
        description: 'Lead all groups to the assembly point. Transport toddlers in a pram.',
        points: 30,
        interaction: 'ASSEMBLY_POINT',
        requiredTime: 90,
        nextStep: 'COUNT_CHILDREN'
      },
      COUNT_CHILDREN: {
        title: 'Verify Attendance',
        description: 'Count all children and compare with the attendance list.',
        points: 20,
        interaction: 'ATTENDANCE_LIST',
        requiredTime: 30,
        nextStep: 'INFORM_PARENTS'
      },
      INFORM_PARENTS: {
        title: 'Inform Parents',
        description: 'Contact parents using the emergency phone list.',
        points: 15,
        interaction: 'PARENT_CONTACT',
        requiredTime: 60,
        nextStep: null
      }
    };

    // Define interaction points for fire alarm steps
    this.interactionPoints = {
      EMERGENCY_BUTTON: {
        type: 'button',
        icon: '🔴',
        position: { x: 5, y: 1, z: 5 },
        tooltip: 'Emergency Button'
      },
      EMERGENCY_PHONE: {
        type: 'phone',
        icon: '📞',
        position: { x: 6, y: 1, z: 5 },
        tooltip: 'Emergency Phone'
      },
      GROUP_ASSEMBLY: {
        type: 'area',
        icon: '👥',
        position: { x: 0, y: 1, z: 0 },
        tooltip: 'Group Assembly Point'
      },
      ROOM_CHECK: {
        type: 'checklist',
        icon: '📋',
        position: { x: -5, y: 1, z: 0 },
        tooltip: 'Room Check'
      },
      ASSEMBLY_POINT: {
        type: 'area',
        icon: '🎯',
        position: { x: -10, y: 1, z: -10 },
        tooltip: 'Assembly Point'
      },
      ATTENDANCE_LIST: {
        type: 'document',
        icon: '📝',
        position: { x: -11, y: 1, z: -10 },
        tooltip: 'Attendance List'
      },
      PARENT_CONTACT: {
        type: 'phone',
        icon: '📱',
        position: { x: -12, y: 1, z: -10 },
        tooltip: 'Parent Contact List'
      }
    };

    this.currentFireAlarmStep = null;
    this.completedSteps = new Set();
    
    // Define possible events
    this.eventTypes = {
      FIRE_ALARM: {
        type: 'emergency',
        title: 'Fire Alarm!',
        description: 'A fire alarm has been triggered. Initiate the evacuation!',
        duration: 300, // 5 minutes in game time
        handler: () => this.handleFireAlarm()
      },
      INSPECTION: {
        type: 'routine',
        title: 'Safety Inspection',
        description: 'Time for routine safety inspection.',
        duration: 120,
        handler: () => this.handleInspection()
      },
      SMOKE_DETECTOR: {
        type: 'maintenance',
        title: 'Smoke Detector Maintenance',
        description: 'A smoke detector needs to be checked.',
        duration: 60,
        handler: () => this.handleDetectorMaintenance()
      }
    };

    // Bind methods to this instance
    this.checkForEvents = this.checkForEvents.bind(this);
    this.triggerEvent = this.triggerEvent.bind(this);
    this.handleFireAlarm = this.handleFireAlarm.bind(this);
    this.handleInspection = this.handleInspection.bind(this);
  }

  checkForEvents() {
    if (!this.game || !this.game.state) return;

    const currentTime = this.game.state.time;
    const currentDay = this.game.state.day;

    // Check for scheduled events
    this.scheduledEvents = this.scheduledEvents.filter(event => {
      if (event.day === currentDay && event.time === currentTime) {
        this.triggerEvent(event.type);
        return false;
      }
      return true;
    });

    // Random events based on conditions
    if (Math.random() < 0.001 && !this.hasActiveEmergency()) {
      this.triggerEvent('FIRE_ALARM');
    }
  }

  triggerEvent(eventType) {
    const event = this.eventTypes[eventType];
    if (!event) return;

    const eventInstance = {
      ...event,
      startTime: this.game.state.time,
      id: Date.now()
    };

    this.activeEvents.add(eventInstance);

    // Update UI
    if (event.type === 'emergency') {
      document.body.classList.add('emergency');
    }

    // Show event modal
    if (this.game && this.game.ui) {
      this.game.ui.showEventModal(event);
    }

    // Start event handler
    event.handler();
  }

  hasActiveEmergency() {
    return Array.from(this.activeEvents).some(event => event.type === 'emergency');
  }

  handleFireAlarm() {
    if (!this.game || !this.game.world) return;

    // Start with first step if not already in progress
    if (!this.currentFireAlarmStep) {
      this.currentFireAlarmStep = 'ALERT_STAFF';
      this.startFireAlarmStep(this.currentFireAlarmStep);
    }

    // Create interaction points in the world
    Object.entries(this.interactionPoints).forEach(([key, point]) => {
      this.game.world.createInteractionPoint(
        point.position.x,
        point.position.y,
        point.position.z,
        point.type,
        point.icon,
        point.tooltip,
        () => this.handleInteraction(key)
      );
    });

    // Start evacuation process for NPCs
    const npcs = Array.from(this.game.world.npcs);
    npcs.forEach(npc => {
      if (npc.age <= 2) {
        npc.state = 'needs_assistance';
      } else {
        npc.state = 'evacuating';
      }
    });
  }

  handleInteraction(interactionKey) {
    if (!this.currentFireAlarmStep) return;
    
    const currentStep = this.fireAlarmSteps[this.currentFireAlarmStep];
    if (currentStep.interaction === interactionKey) {
      // Start timer for required action time
      setTimeout(() => {
        this.completeFireAlarmStep();
      }, currentStep.requiredTime * 1000);

      // Show progress modal
      if (this.game && this.game.ui) {
        this.game.ui.showProgressModal(currentStep);
      }
    }
  }

  startFireAlarmStep(stepKey) {
    const step = this.fireAlarmSteps[stepKey];
    if (!step) return;

    // Define extra instructions for clarity on what to do with the interactive objects
    const stepInstructions = {
      ALERT_STAFF: "Please click on the highlighted emergency button (🔴) to alert the staff.",
      CALL_EMERGENCY: "Please interact with the emergency phone (📞) to place the call.",
      START_EVACUATION: "Please gather all children and lead them to the assembly point (👥).",
      CHECK_ROOMS: "Please inspect each room (📋) for any children that might have been left behind.",
      REACH_ASSEMBLY: "Please proceed to the assembly point (🎯) and ensure everyone is gathered.",
      COUNT_CHILDREN: "Please verify attendance by clicking on the attendance list (📝).",
      INFORM_PARENTS: "Please contact the parents using the provided parent contact list (📱)."
    };

    const extraInstruction = stepInstructions[stepKey] || "";
    
    // Show enhanced step instructions in the modal
    if (this.game && this.game.ui) {
      this.game.ui.showEventModal({
        title: step.title,
        description: step.description + " " + extraInstruction,
        type: 'emergency_step'
      });
    }
    
    // Highlight the relevant interaction point in the world
    const interactionPoint = this.interactionPoints[step.interaction];
    if (interactionPoint) {
      this.game.world.highlightInteractionPoint(interactionPoint.position);
    }
  }

  completeFireAlarmStep() {
    if (!this.currentFireAlarmStep) return;

    const currentStep = this.fireAlarmSteps[this.currentFireAlarmStep];
    
    // Award points
    this.game.state.addExperience(currentStep.points);
    
    // Mark step as completed
    this.completedSteps.add(this.currentFireAlarmStep);
    
    // Move to next step if exists
    if (currentStep.nextStep) {
      this.currentFireAlarmStep = currentStep.nextStep;
      this.startFireAlarmStep(this.currentFireAlarmStep);
    } else {
      // All steps completed
      this.resolveFireAlarm();
    }
  }

  resolveFireAlarm() {
    // Clear interaction points
    Object.values(this.interactionPoints).forEach(point => {
      this.game.world.removeInteractionPoint(point.position);
    });

    // Reset NPCs
    const npcs = Array.from(this.game.world.npcs);
    npcs.forEach(npc => {
      npc.state = 'normal';
    });

    // Clear emergency state
    this.currentFireAlarmStep = null;
    this.completedSteps.clear();
    document.body.classList.remove('emergency');

    // Show completion modal
    if (this.game && this.game.ui) {
      this.game.ui.showEventModal({
        title: 'Fire alarm completed',
        description: 'All evacuation steps have been successfully completed.',
        type: 'success'
      });
    }
  }

  handleInspection() {
    if (!this.game) return;

    const checklist = [
      'Check fire extinguishers',
      'Inspect exit routes',
      'Test smoke detectors'
    ];

    let completed = 0;
    checklist.forEach(item => {
      const success = Math.random() > 0.2;
      if (success) {
        completed++;
        this.game.state.addExperience(20);
      }
    });

    // Resolve after completion
    if (completed === checklist.length) {
      this.resolveEvent(Array.from(this.activeEvents)
        .find(event => event.type === 'INSPECTION')?.id);
    }
  }

  handleDetectorMaintenance() {
    // Implementation for smoke detector maintenance
  }

  scheduleEvent(eventType, day, time) {
    this.scheduledEvents.push({ type: eventType, day, time });
  }

  resolveEvent(eventId) {
    if (!eventId) return;

    const event = Array.from(this.activeEvents)
      .find(e => e.id === eventId);
      
    if (event) {
      this.activeEvents.delete(event);
      
      if (!this.hasActiveEmergency()) {
        document.body.classList.remove('emergency');
      }
    }
  }
}