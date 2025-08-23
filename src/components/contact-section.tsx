"use client";

import React, { useEffect, useRef } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { validateContactForm } from "@/lib/actions";
import emailjs from '@emailjs/browser';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, Send } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

export function ContactSection() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Refs for GSAP animation targets
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const section = sectionRef.current;
    const imageElement = imageRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const formElement = formRef.current;

    if (!section || !imageElement || !title || !subtitle || !formElement) return;

    // Find the previous section (What I Do section) for overlap effect
    const previousSection = document.querySelector('.what-i-do-section') as HTMLElement;
    
    // Set initial states for overlap scroll effect
    gsap.set(section, {
      y: '100%', // Start completely below viewport
      willChange: 'transform',
      zIndex: 10 // Ensure contact section overlaps previous section
    });

    // Set initial states for content elements (hidden until overlap completes)
    gsap.set([imageElement, title, subtitle], {
      opacity: 0,
      y: 30,
      willChange: "transform, opacity"
    });

    // Set initial states for form elements
    const formElements = formElement.querySelectorAll('label, input, textarea, button');
    gsap.set(formElements, {
      opacity: 0,
      y: 30,
      willChange: "transform, opacity"
    });

    // OVERLAP SCROLL ANIMATION
    // Pin the previous section and animate contact section sliding up over it
    if (previousSection) {
      // Create main timeline for overlap effect
      const overlapTl = gsap.timeline();
      
      // Add the slide-up animation
      overlapTl.to(section, {
        y: '0%', // Slide contact section up to normal position
        ease: "none"
      });
      
      // Add content animations that happen during the scroll
      overlapTl.to(imageElement, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "none"
      }, 0.6); // Start image animation at 60%
      
      overlapTl.to([title, subtitle], {
        opacity: 1,
        y: 0,
        duration: 0.3,
        stagger: 0.1,
        ease: "none"
      }, 0.7); // Start when overlap is 70% complete
      
      overlapTl.to(formElements, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        stagger: 0.05,
        ease: "none"
      }, 0.8); // Start when overlap is 80% complete

      ScrollTrigger.create({
        trigger: previousSection,
        start: "center bottom", // Start earlier - when previous section center hits bottom
        end: "+=100vh", // Animation lasts for one viewport height (adjust duration here)
        pin: previousSection, // Pin the previous section during overlap
        scrub: 1, // Smooth scroll syncing with slight lag
        ease: "none", // Clean, natural feel
        animation: overlapTl,
        // Uncomment for debugging:
        // markers: true
      });
    } else {
      // Fallback animation if previous section not found
      gsap.set(section, { y: '0%' });
      
      const fallbackTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "top 20%",
          toggleActions: "play none none reverse"
        }
      });

      fallbackTl.to(imageElement, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      }).to([title, subtitle], {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out"
      }, "-=0.6").to(formElements, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
      }, "-=0.4");
    }

    // Responsive adjustments for mobile
    const mm = gsap.matchMedia();
    
    mm.add("(max-width: 768px)", () => {
      // On mobile, reduce the overlap distance for better UX
      if (previousSection) {
        // Kill existing ScrollTriggers for this section
        ScrollTrigger.getAll().forEach(trigger => {
          if (trigger.trigger === previousSection) {
            trigger.kill();
          }
        });
        
        // Create mobile-optimized timeline
        const mobileOverlapTl = gsap.timeline();
        
        mobileOverlapTl.to(section, {
          y: '0%',
          ease: "none"
        });
        
        mobileOverlapTl.to(imageElement, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "none"
        }, 0.5);
        
        mobileOverlapTl.to([title, subtitle], {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: "none"
        }, 0.6);
        
        mobileOverlapTl.to(formElements, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "none"
        }, 0.7);
        
        ScrollTrigger.create({
          id: "overlap-scroll-mobile",
          trigger: previousSection,
          start: "center bottom", // Start earlier on mobile too
          end: "+=50vh", // Shorter overlap on mobile (adjust mobile duration here)
          pin: previousSection,
          scrub: 1,
          ease: "none",
          animation: mobileOverlapTl
        });
      }
    });

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === section || trigger.trigger === previousSection) {
          trigger.kill();
        }
      });
      mm.revert();
    };
  }, []);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // First validate the form data
      const result = validateContactForm(data);
      
      if (!result.success) {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              form.setError(field as keyof typeof data, {
                type: "server",
                message: messages[0],
              });
            }
          });
        }
        setIsSubmitting(false);
        return;
      }

      // Send email using EmailJS
      const templateParams = {
        from_name: `${data.firstName} ${data.lastName}`,
        from_email: data.email,
        phone: data.phone,
        message: data.message,
        to_email: 'bharathnaidu1402@gmail.com'
      };

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      toast({
        title: "Message sent!",
        description: "Thank you for your message! I'll get back to you soon.",
      });
      form.reset();
      
    } catch (error) {
      console.error("Email sending error:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again or contact me directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section 
      ref={sectionRef}
      id="contact" 
      className="relative min-h-screen py-12 md:py-16 overflow-hidden bg-background film-grain"
      style={{
        // Ensure section has full width for seamless overlap
        width: '100%',
        // Ensure proper stacking context for overlap
        position: 'relative',
        zIndex: 10
      }}
    >
      {/* Split Layout Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 h-full items-center">
          
          {/* Left Side - Image and Contact Info */}
          <div ref={imageRef} className="relative">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 p-1">
              <div className="relative rounded-3xl overflow-hidden">
                <img 
                  src="/assets/profile-hero.jpg" 
                  alt="Contact Profile" 
                  className="w-full h-[500px] lg:h-[600px] object-cover"
                />
                <div className="absolute inset-0 video-overlay" />
              </div>
            </div>
            
            {/* Contact Info Overlay */}
            <div className="absolute bottom-8 left-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/20 backdrop-blur-lg rounded-xl flex items-center justify-center border border-primary/30">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 ref={titleRef} className="text-2xl font-black font-headline">Let's Create Together</h3>
                </div>
              </div>
              <p ref={subtitleRef} className="text-sm text-white/80 max-w-xs leading-relaxed">
                Ready to bring your vision to life? Let's discuss your next cinematic project and create something extraordinary together.
              </p>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="lg:pl-8">
            <div ref={formRef}>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* First Name and Last Name Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground/80">First name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your first name" 
                              {...field} 
                              className="h-12 text-base bg-input border-border text-foreground placeholder:text-foreground/50 rounded-lg focus:border-primary focus:ring-primary cinematic-transition shadow-sm" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground/80">Last name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your last name" 
                              {...field} 
                              className="h-12 text-base bg-input border-border text-foreground placeholder:text-foreground/50 rounded-lg focus:border-primary focus:ring-primary cinematic-transition shadow-sm" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground/80">
                          E-mail address <span className="text-primary">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="your.email@example.com" 
                            {...field} 
                            className="h-12 text-base bg-input border-border text-foreground placeholder:text-foreground/50 rounded-lg focus:border-primary focus:ring-primary cinematic-transition shadow-sm" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone Field */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground/80">
                          Phone <span className="text-primary">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="flex">
                            <div className="flex items-center px-3 bg-input border border-r-0 border-border rounded-l-lg">
                              <span className="text-sm text-foreground/60">🇮🇳 +91</span>
                            </div>
                            <Input 
                              placeholder="Your phone number" 
                              {...field} 
                              className="h-12 text-base bg-input border-border text-foreground placeholder:text-foreground/50 rounded-l-none rounded-r-lg focus:border-primary focus:ring-primary cinematic-transition shadow-sm" 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Message Field */}
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground/80">Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell me about your project vision, goals, and how I can help bring your story to life..." 
                            {...field} 
                            rows={4} 
                            className="text-base bg-input border-border text-foreground placeholder:text-foreground/50 rounded-lg focus:border-primary focus:ring-primary resize-none cinematic-transition shadow-sm" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg cinematic-button cinematic-transition" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
