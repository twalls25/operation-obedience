export type CommentParent =
  | {
      testimonyId: string;
      prayerRequestId?: undefined;
      checkinId?: undefined;
      messageBoardPostId?: undefined;
    }
  | {
      testimonyId?: undefined;
      prayerRequestId: string;
      checkinId?: undefined;
      messageBoardPostId?: undefined;
    }
  | {
      testimonyId?: undefined;
      prayerRequestId?: undefined;
      checkinId: string;
      messageBoardPostId?: undefined;
    }
  | {
      testimonyId?: undefined;
      prayerRequestId?: undefined;
      checkinId?: undefined;
      messageBoardPostId: string;
    };

export function parentColumn(parent: CommentParent): {
  column: "testimony_id" | "prayer_request_id" | "checkin_id" | "message_board_post_id";
  value: string;
} {
  if (parent.testimonyId) {
    return { column: "testimony_id", value: parent.testimonyId };
  }
  if (parent.prayerRequestId) {
    return { column: "prayer_request_id", value: parent.prayerRequestId };
  }
  if (parent.checkinId) {
    return { column: "checkin_id", value: parent.checkinId };
  }
  // CommentParent's union guarantees messageBoardPostId is set here (the
  // other three branches returned already) — TS can't narrow that through
  // optional properties without a discriminant tag, hence the assertion.
  return { column: "message_board_post_id", value: parent.messageBoardPostId as string };
}
