CREATE TRIGGER delete_expired_user_tokens_trigger
AFTER INSERT ON "UserToken"
EXECUTE FUNCTION delete_expired_user_tokens();
