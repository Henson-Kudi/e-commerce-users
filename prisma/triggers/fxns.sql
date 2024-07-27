CREATE OR REPLACE FUNCTION delete_expired_user_tokens()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM "UserToken" WHERE expireAt < NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
