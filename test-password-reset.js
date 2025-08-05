// Test Supabase Password Reset - Run this in browser console on your app
// Go to your login page and run this in the browser developer console

async function testPasswordReset() {
    console.log('Testing password reset...');
    
    try {
        // Import your supabase client (you'll need to adjust this)
        const response = await supabase.auth.resetPasswordForEmail('your-email@example.com', {
            redirectTo: `${window.location.origin}/update-password`,
        });
        
        console.log('Password reset response:', response);
        
        if (response.error) {
            console.error('Error:', response.error);
        } else {
            console.log('✅ Password reset email sent successfully');
            console.log('📧 Check your email and examine the full link');
        }
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testPasswordReset();

console.log(`
🔍 DEBUGGING STEPS:
1. Run testPasswordReset() in console
2. Check the email you receive  
3. Right-click the reset link and "Copy link address"
4. Compare the full URL length with the expected format
5. Look for any ... or truncation in the email

Expected format:
https://your-project.supabase.co/auth/v1/verify?token=VERY_LONG_TOKEN_HERE&type=recovery&redirect_to=http://localhost:5173/update-password
`);
