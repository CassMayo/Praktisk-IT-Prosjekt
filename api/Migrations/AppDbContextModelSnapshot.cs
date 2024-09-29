﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using api.DAL.Models;

#nullable disable

namespace api.Migrations
{
    [DbContext(typeof(AppDbContext))]
    partial class AppDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "8.0.0");

            modelBuilder.Entity("api.DAL.Models.Item", b =>
                {
                    b.Property<int>("ItemId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("ItemName")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<int>("ItemType")
                        .HasColumnType("INTEGER");

                    b.Property<float>("Price")
                        .HasColumnType("REAL");

                    b.Property<int>("RequestId")
                        .HasColumnType("INTEGER");

                    b.HasKey("ItemId");

                    b.HasIndex("RequestId");

                    b.ToTable("Items");
                });

            modelBuilder.Entity("api.DAL.Models.Request", b =>
                {
                    b.Property<int>("RequestId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("TEXT");

                    b.Property<string>("Description")
                        .HasColumnType("TEXT");

                    b.Property<string>("DriverEmail")
                        .HasColumnType("TEXT");

                    b.Property<string>("DropoffLocation")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("PickupLocation")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<DateTime?>("ScheduledAt")
                        .HasColumnType("TEXT");

                    b.Property<string>("SenderEmail")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<int>("Status")
                        .HasColumnType("INTEGER");

                    b.HasKey("RequestId");

                    b.HasIndex("DriverEmail");

                    b.HasIndex("SenderEmail");

                    b.ToTable("Requests");
                });

            modelBuilder.Entity("api.DAL.Models.User", b =>
                {
                    b.Property<string>("Email")
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("TEXT");

                    b.Property<bool>("IsDriver")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("Password")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("Pfp")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.HasKey("Email");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("api.DAL.Models.Item", b =>
                {
                    b.HasOne("api.DAL.Models.Request", "Request")
                        .WithMany()
                        .HasForeignKey("RequestId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Request");
                });

            modelBuilder.Entity("api.DAL.Models.Request", b =>
                {
                    b.HasOne("api.DAL.Models.User", "Driver")
                        .WithMany()
                        .HasForeignKey("DriverEmail");

                    b.HasOne("api.DAL.Models.User", "Sender")
                        .WithMany()
                        .HasForeignKey("SenderEmail")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Driver");

                    b.Navigation("Sender");
                });
#pragma warning restore 612, 618
        }
    }
}