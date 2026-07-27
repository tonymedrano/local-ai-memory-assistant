const DAYS = 180;

if (memory.importance < 0.5 && daysWithoutAccess > DAYS) {
  memory.archived = true;
}
