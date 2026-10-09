from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from api.db.database import Base
import datetime
from werkzeug.security import generate_password_hash, check_password_hash


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(Integer, nullable=False)

    note_id: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)

    title: Mapped[str] = mapped_column(String, nullable=False)
    subject: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(String, nullable=False)
    quiz: Mapped[str] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # 3. DateTime with Python-Generated Update (Tracks last modification)
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_name: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    _password_hash: Mapped[str] = mapped_column(String, nullable=False)

    @property
    def password(self):
        """Property to prevent reading the password directly."""
        raise AttributeError("Password is not a readable attribute.")

    @password.setter
    def password(self, password: str):
        """Hash the password and store it in the _password_hash field."""
        self._password_hash = generate_password_hash(password)

    def verify_password(self, password: str) -> bool:
        """Verify the provided password against the stored hash."""
        return check_password_hash(self._password_hash, password)