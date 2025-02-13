export class GameState {
  constructor() {
    this.budget = 10000;
    this.experience = 0;
    this.day = 1;
    this.time = 480; // Minutes from midnight
    this.gameSpeed = 1;
    this.isPaused = false;
    this.isBuildMode = false;
    this.isCheckMode = false;
    this.inventory = new Map();
    
    this.simTime = {
      hour: 8,
      minute: 0,
      dayPart: 'morning'
    };
    
    this.schedules = {
      morning: {
        start: 6,
        end: 12,
        activities: ['breakfast', 'learning', 'outdoor']
      },
      afternoon: {
        start: 12,
        end: 18,
        activities: ['lunch', 'nap', 'play']
      },
      evening: {
        start: 18,
        end: 22,
        activities: ['dinner', 'cleanup', 'preparation']
      }
    };
    
    this.events = {
      mealTime: false,
      napTime: false,
      playTime: false,
      learningTime: false,
      emergencyDrill: false
    };
    
    this.statistics = {
      childrenHappiness: 100,
      teacherSatisfaction: 100,
      safetyRating: 100,
      cleanliness: 100
    };
  }

  updateSimTime() {
    this.simTime.minute += this.gameSpeed;
    if (this.simTime.minute >= 60) {
      this.simTime.minute = 0;
      this.simTime.hour++;
      
      if (this.simTime.hour >= 24) {
        this.simTime.hour = 0;
        this.day++;
      }
    }
    
    // Update day part
    if (this.simTime.hour >= 6 && this.simTime.hour < 12) {
      this.simTime.dayPart = 'morning';
    } else if (this.simTime.hour >= 12 && this.simTime.hour < 18) {
      this.simTime.dayPart = 'afternoon';
    } else {
      this.simTime.dayPart = 'evening';
    }
    
    this.checkScheduledEvents();
  }

  checkScheduledEvents() {
    const schedule = this.schedules[this.simTime.dayPart];
    if (!schedule) return;

    // Check if we should start any scheduled activities
    schedule.activities.forEach(activity => {
      switch(activity) {
        case 'breakfast':
          if (this.simTime.hour === 8 && this.simTime.minute === 0) {
            this.events.mealTime = true;
          }
          break;
        case 'lunch':
          if (this.simTime.hour === 12 && this.simTime.minute === 0) {
            this.events.mealTime = true;
          }
          break;
        case 'nap':
          if (this.simTime.hour === 13 && this.simTime.minute === 0) {
            this.events.napTime = true;
          }
          break;
        // Add more scheduled events...
      }
    });
  }

  updateStatistics() {
    // Update statistics based on current state
    const npcs = Array.from(window.game.npcManager.npcs.values());
    
    // Calculate average happiness of children
    const children = npcs.filter(npc => npc.type === 'child');
    this.statistics.childrenHappiness = children.reduce((sum, child) => {
      return sum + Object.values(child.needs).reduce((a, b) => a + b) / 5;
    }, 0) / children.length;

    // Calculate teacher satisfaction
    const teachers = npcs.filter(npc => npc.type === 'teacher');
    this.statistics.teacherSatisfaction = teachers.reduce((sum, teacher) => {
      return sum + Object.values(teacher.needs).reduce((a, b) => a + b) / 5;
    }, 0) / teachers.length;

    // Update other statistics...
    this.budget += this.calculateDailyIncome();
  }

  calculateDailyIncome() {
    const baseIncome = 1000;
    const happinessBonus = this.statistics.childrenHappiness * 2;
    const satisfactionBonus = this.statistics.teacherSatisfaction;
    
    return baseIncome + happinessBonus + satisfactionBonus;
  }

  updateTime() {
    if (this.isPaused) return;
    
    this.time += this.gameSpeed;
    if (this.time >= 1440) { // New day
      this.time = 0;
      this.day++;
      this.onNewDay();
    }
  }

  onNewDay() {
    // Daily updates
    this.budget += 1000; // Daily budget increase
    this.checkDailyTasks();
  }

  checkDailyTasks() {
    // Check if all safety measures are in place
    // Award experience points accordingly
  }

  getTimeString() {
    const hours = Math.floor(this.time / 60);
    const minutes = this.time % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  toggleGameSpeed() {
    const speeds = [1, 2, 4];
    const currentIndex = speeds.indexOf(this.gameSpeed);
    this.gameSpeed = speeds[(currentIndex + 1) % speeds.length];
  }

  addToInventory(item, quantity = 1) {
    const current = this.inventory.get(item) || 0;
    this.inventory.set(item, current + quantity);
  }

  removeFromInventory(item, quantity = 1) {
    const current = this.inventory.get(item) || 0;
    if (current >= quantity) {
      this.inventory.set(item, current - quantity);
      return true;
    }
    return false;
  }

  addExperience(amount) {
    this.experience += amount;
    // Trigger level-up check
    this.checkLevelUp();
  }

  checkLevelUp() {
    const previousLevel = Math.floor(this.experience / 1000);
    const currentLevel = Math.floor((this.experience + 1) / 1000);
    
    if (currentLevel > previousLevel) {
      this.onLevelUp(currentLevel);
    }
  }

  onLevelUp(level) {
    // Trigger level-up rewards
    this.budget += level * 500;
    
    // Notify UI
    if (this.game && this.game.ui) {
      this.game.ui.showLevelUpModal(level);
    }
  }
}