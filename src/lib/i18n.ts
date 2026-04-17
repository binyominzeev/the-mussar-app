export type Language = 'en' | 'hu'

export interface Translations {
  nav: {
    goals: string
    knowledge: string
    habits: string
    review: string
    admin: string
    signOut: string
  }
  login: {
    title: string
    subtitle: string
    email: string
    password: string
    signingIn: string
    signIn: string
    invalidCredentials: string
  }
  dashboard: {
    title: string
    completed: string
    noGoals: string
    createFirstGoal: string
    dailyReflection: string
    biggestDifficulty: string
    optional: string
    saveReflection: string
    saved: string
    writeReflection: string
  }
  goals: {
    title: string
    newGoal: string
    noGoals: string
    knowledge: string
    habits: string
    edit: string
    delete: string
    del: string
    editModeOn: string
    editModeOff: string
    noFocuses: string
    addAction: string
    addFocus: string
    addFocusFor: string
    activate: string
    deactivate: string
    inactive: string
    deleteGoalConfirm: string
    deleteFocusConfirm: string
    deleteActionConfirm: string
    goalFormNew: string
    goalFormEdit: string
    goalTypeKnowledge: string
    goalTypeHabits: string
    titlePlaceholder: string
    descriptionPlaceholder: string
    save: string
    cancel: string
    focusFormNew: string
    focusFormEdit: string
    actionTitlePlaceholder: string
    actionTypeBinary: string
    actionTypeQuantitative: string
    actionTypeReflection: string
    activeWeekdays: string
    weekdayMon: string
    weekdayTue: string
    weekdayWed: string
    weekdayThu: string
    weekdayFri: string
    weekdaySat: string
    weekdaySun: string
    weeklyOverview: string
    weeklyOverviewHint: string
    noFocusesScheduled: string
  }
  review: {
    title: string
    last7: string
    last14: string
    last30: string
    noCheckins: string
    days: string
    weeklyReflection: string
    reflectionPlaceholder: string
    saveReflection: string
  }
  admin: {
    title: string
    users: string
    pairs: string
    newUser: string
    editUser: string
    newUserForm: string
    addPair: string
    addPairForm: string
    edit: string
    delete: string
    remove: string
    noPairs: string
    namePlaceholder: string
    emailPlaceholder: string
    passwordPlaceholder: string
    passwordChangePlaceholder: string
    isAdmin: string
    save: string
    cancel: string
    deleteUserConfirm: string
    deletePairConfirm: string
    pairTypeChavruta: string
    pairTypeCoach: string
  }
}

export const translations: Record<Language, Translations> = {
  en: {
    // Nav
    nav: {
      goals: 'Goals',
      knowledge: 'Knowledge',
      habits: 'Habits',
      review: 'Overview',
      admin: 'Admin',
      signOut: 'Sign out',
    },
    // Login
    login: {
      title: 'Mussar App',
      subtitle: 'Personal growth & accountability',
      email: 'Email',
      password: 'Password',
      signingIn: 'Signing in...',
      signIn: 'Sign in',
      invalidCredentials: 'Invalid email or password',
    },
    // Dashboard
    dashboard: {
      title: 'Today',
      completed: 'completed',
      noGoals: 'No goals yet.',
      createFirstGoal: 'Create your first goal',
      dailyReflection: 'Daily reflection',
      biggestDifficulty: 'What was the biggest difficulty today?',
      optional: 'Optional...',
      saveReflection: 'Save reflection',
      saved: '✓ Saved',
      writeReflection: 'Write your reflection...',
    },
    // Goals
    goals: {
      title: 'Goals',
      newGoal: '+ New Goal',
      noGoals: 'No goals yet.',
      knowledge: '📚 Knowledge',
      habits: '⚡ Habits',
      edit: 'Edit',
      delete: 'Delete',
      del: 'Del',
      editModeOn: 'Edit mode: On',
      editModeOff: 'Edit mode: Off',
      noFocuses: 'No focuses yet.',
      addAction: '+ Add action',
      addFocus: '+ Add focus',
      addFocusFor: '+ Add focus',
      activate: 'Activate',
      deactivate: 'Deactivate',
      inactive: 'Inactive',
      deleteGoalConfirm: 'Delete this goal?',
      deleteFocusConfirm: 'Delete this focus?',
      deleteActionConfirm: 'Delete this action?',
      // GoalForm
      goalFormNew: 'New Goal',
      goalFormEdit: 'Edit Goal',
      goalTypeKnowledge: 'Knowledge',
      goalTypeHabits: 'Habits',
      titlePlaceholder: 'Title',
      descriptionPlaceholder: 'Description',
      save: 'Save',
      cancel: 'Cancel',
      // FocusForm
      focusFormNew: 'New Focus',
      focusFormEdit: 'Edit Focus',
      // ActionForm
      actionTitlePlaceholder: 'Action title',
      actionTypeBinary: 'Binary (yes/no)',
      actionTypeQuantitative: 'Quantitative (number)',
      actionTypeReflection: 'Reflection (text)',
      activeWeekdays: 'Active days',
      weekdayMon: 'M',
      weekdayTue: 'T',
      weekdayWed: 'W',
      weekdayThu: 'Th',
      weekdayFri: 'F',
      weekdaySat: 'Sa',
      weekdaySun: 'Su',
      weeklyOverview: 'Weekly overview',
      weeklyOverviewHint: 'See each active focus line-by-line and use colors to track its weekly schedule.',
      noFocusesScheduled: '—',
    },
    // Review
    review: {
      title: 'Weekly Review',
      last7: 'Last 7 days',
      last14: 'Last 14 days',
      last30: 'Last 30 days',
      noCheckins: 'No check-ins yet.',
      days: 'days',
      weeklyReflection: 'Weekly reflection',
      reflectionPlaceholder: 'What went well? What needs improvement? What will you focus on next week?',
      saveReflection: 'Save reflection',
    },
    // Admin
    admin: {
      title: 'Admin Panel',
      users: 'Users',
      pairs: 'Accountability Pairs',
      newUser: '+ New User',
      editUser: 'Edit User',
      newUserForm: 'New User',
      addPair: '+ Add Pair',
      addPairForm: 'Add Accountability Pair',
      edit: 'Edit',
      delete: 'Delete',
      remove: 'Remove',
      noPairs: 'No pairs yet.',
      namePlaceholder: 'Name',
      emailPlaceholder: 'Email',
      passwordPlaceholder: 'Password',
      passwordChangePlaceholder: 'New password (optional)',
      isAdmin: 'Admin',
      save: 'Save',
      cancel: 'Cancel',
      deleteUserConfirm: 'Delete user?',
      deletePairConfirm: 'Remove pair?',
      pairTypeChavruta: 'Chavruta',
      pairTypeCoach: 'Coach',
    },
  },
  hu: {
    // Nav
    nav: {
      goals: 'Célok',
      knowledge: 'Tudás',
      habits: 'Szokások',
      review: 'Áttekintés',
      admin: 'Admin',
      signOut: 'Kijelentkezés',
    },
    // Login
    login: {
      title: 'Mussar App',
      subtitle: 'Személyes fejlődés és elszámoltathatóság',
      email: 'E-mail',
      password: 'Jelszó',
      signingIn: 'Bejelentkezés...',
      signIn: 'Bejelentkezés',
      invalidCredentials: 'Érvénytelen e-mail cím vagy jelszó',
    },
    // Dashboard
    dashboard: {
      title: 'Ma',
      completed: 'teljesített',
      noGoals: 'Még nincsenek célok.',
      createFirstGoal: 'Hozd létre az első célodat',
      dailyReflection: 'Napi reflexió',
      biggestDifficulty: 'Mi volt a mai legnagyobb nehézség?',
      optional: 'Opcionális...',
      saveReflection: 'Reflexió mentése',
      saved: '✓ Mentve',
      writeReflection: 'Írj reflexiót...',
    },
    // Goals
    goals: {
      title: 'Célok',
      newGoal: '+ Új cél',
      noGoals: 'Még nincsenek célok.',
      knowledge: '📚 Tudás',
      habits: '⚡ Szokások',
      edit: 'Szerkesztés',
      delete: 'Törlés',
      del: 'Törl',
      editModeOn: 'Szerkesztés: Be',
      editModeOff: 'Szerkesztés: Ki',
      noFocuses: 'Még nincsenek fókuszok.',
      addAction: '+ Cselekvés hozzáadása',
      addFocus: '+ Fókusz hozzáadása',
      addFocusFor: '+ Fókusz hozzáadása',
      activate: 'Aktiválás',
      deactivate: 'Kikapcsolás',
      inactive: 'Inaktív',
      deleteGoalConfirm: 'Töröljük ezt a célt?',
      deleteFocusConfirm: 'Töröljük ezt a fókuszt?',
      deleteActionConfirm: 'Töröljük ezt a cselekvést?',
      // GoalForm
      goalFormNew: 'Új cél',
      goalFormEdit: 'Cél szerkesztése',
      goalTypeKnowledge: 'Tudás',
      goalTypeHabits: 'Szokások',
      titlePlaceholder: 'Cím',
      descriptionPlaceholder: 'Leírás',
      save: 'Mentés',
      cancel: 'Mégse',
      // FocusForm
      focusFormNew: 'Új fókusz',
      focusFormEdit: 'Fókusz szerkesztése',
      // ActionForm
      actionTitlePlaceholder: 'Cselekvés neve',
      actionTypeBinary: 'Bináris (igen/nem)',
      actionTypeQuantitative: 'Mennyiségi (szám)',
      actionTypeReflection: 'Reflexió (szöveg)',
      activeWeekdays: 'Aktív napok',
      weekdayMon: 'H',
      weekdayTue: 'K',
      weekdayWed: 'Sze',
      weekdayThu: 'Cs',
      weekdayFri: 'P',
      weekdaySat: 'Szo',
      weekdaySun: 'V',
      weeklyOverview: 'Heti áttekintés',
      weeklyOverviewHint: 'Nézd meg az aktív fókuszokat soronként, és használd a színeket a heti beosztás követéséhez.',
      noFocusesScheduled: '—',
    },
    // Review
    review: {
      title: 'Heti áttekintés',
      last7: 'Utolsó 7 nap',
      last14: 'Utolsó 14 nap',
      last30: 'Utolsó 30 nap',
      noCheckins: 'Még nincs bejelentkezés.',
      days: 'nap',
      weeklyReflection: 'Heti reflexió',
      reflectionPlaceholder: 'Mi ment jól? Min kell javítani? Mire fogsz koncentrálni jövő héten?',
      saveReflection: 'Reflexió mentése',
    },
    // Admin
    admin: {
      title: 'Admin panel',
      users: 'Felhasználók',
      pairs: 'Felelősségi párok',
      newUser: '+ Új felhasználó',
      editUser: 'Felhasználó szerkesztése',
      newUserForm: 'Új felhasználó',
      addPair: '+ Pár hozzáadása',
      addPairForm: 'Felelősségi pár hozzáadása',
      edit: 'Szerkesztés',
      delete: 'Törlés',
      remove: 'Eltávolítás',
      noPairs: 'Még nincs pár.',
      namePlaceholder: 'Név',
      emailPlaceholder: 'E-mail',
      passwordPlaceholder: 'Jelszó',
      passwordChangePlaceholder: 'Új jelszó (opcionális)',
      isAdmin: 'Admin',
      save: 'Mentés',
      cancel: 'Mégse',
      deleteUserConfirm: 'Töröljük a felhasználót?',
      deletePairConfirm: 'Eltávolítjuk a párt?',
      pairTypeChavruta: 'Chavruta',
      pairTypeCoach: 'Edző',
    },
  },
}
