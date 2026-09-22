-- Custom SQL migration file, put your code below! --

ALTER TABLE "user" ADD CONSTRAINT "user_role_check" CHECK ("role" in ('learner', 'author'));