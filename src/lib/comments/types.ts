export type CommentParent =
  | { testimonyId: string; prayerRequestId?: undefined; checkinId?: undefined }
  | { testimonyId?: undefined; prayerRequestId: string; checkinId?: undefined }
  | { testimonyId?: undefined; prayerRequestId?: undefined; checkinId: string };

export function parentColumn(parent: CommentParent): {
  column: "testimony_id" | "prayer_request_id" | "checkin_id";
  value: string;
} {
  if (parent.testimonyId) {
    return { column: "testimony_id", value: parent.testimonyId };
  }
  if (parent.prayerRequestId) {
    return { column: "prayer_request_id", value: parent.prayerRequestId };
  }
  return { column: "checkin_id", value: parent.checkinId };
}
